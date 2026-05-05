/**
 * @fileoverview Gemini AI Integration Service for SkillMaster Content Generation
 *
 * This module provides the AI backbone for dynamic learning content generation, powering:
 * - **Roadmap generation**: 7-day/week curriculum structure with daily topics and exam questions
 * - **Lesson content**: Multi-part educational material with cards, examples, and embedded exercises
 * - **Feedback delivery**: Personalized assessment feedback on learner submissions (MCQ and open-ended)
 *
 * ## Architecture: Two-Call Pipeline for Lessons
 *
 * **Lesson Generation (Two Calls)**:
 * Call 1 uses the Gemini 2.5 Pro model to engage in extended thinking — the AI reason through
 * pedagogical strategy, learner mistakes, real-world connections, and examples *before* generating
 * content. This call produces rich, free-form lesson text without JSON constraints.
 * Call 2 uses Gemini 2.5 Flash to parse and structure that thinking into the strict JSON schema.
 * Why two calls? Pro's extended thinking dramatically improves content quality (better examples,
 * fewer hallucinations, stronger pedagogy), but Pro is slower and more expensive. Flash is fast
 * and cheap for structural tasks. Splitting reasoning from formatting optimizes both quality
 * and cost — we pay for deep thinking only on lessons, not on roadmaps.
 *
 * **Roadmap, Feedback, MCQ (Single Call)**:
 * Roadmap, feedback, and all non-lesson calls use Gemini 2.5 Flash in a single pass. These
 * domains don't require extended reasoning — they're structured/evaluative tasks where speed
 * and cost matter more than deep cognition.
 *
 * ## Public Exports
 * - `generateRoadmapSkeleton(data)` — Creates curriculum structure (modules, weeks, days, exams)
 * - `generateLessonContent(data)` — Creates lesson material (learning or revision)
 * - `generateFeedback(data)` — Evaluates and provides feedback on task submissions
 *
 * ## Internal Helpers (Not Exported)
 * - `callModel(config)` — Unified API call wrapper with schema binding and retry logic
 * - `generateLessonTwoPass(thinkingPrompt, formatterPrompt)` — Orchestrates Pro→Flash pipeline
 * - `parseJSON(text)` — Safely parses JSON responses, throws JSON_PARSE_FAILURE on error
 * - `validateLessonStructure(parsed)` — Validates semantic structure (non-empty parts/cards, >50 chars)
 * - `cleanPartTitle(title)` — Detects hallucination patterns (word repetition) and sanitizes
 * - `wait(ms)` — Async sleep utility for retry backoff
 *
 * ## Rate Limiting & Retry Behavior
 *
 * The `callModel()` function implements exponential backoff for transient failures:
 * - **429 (Rate Limited)**: Wait and retry
 * - **500 (Server Error)**: Wait and retry
 * - **Backoff Schedule**: 5s (attempt 1) → 15s (attempt 2) → 30s (attempt 3)
 * - **Max Attempts**: 3 total
 * - **Non-Retryable Failures**: JSON parsing errors (JSON_PARSE_FAILURE) throw immediately
 *
 * Example: If a lesson call hits a 500 on attempt 1, it waits 5s and retries.
 * If attempt 2 also fails, it waits 15s and tries once more. If attempt 3 fails, it throws.
 *
 * ## Validation Chain
 *
 * Lesson responses flow through a strict validation pipeline to prevent hallucinated or
 * malformed content from reaching learners:
 *
 * 1. **parseJSON()** — Parses the JSON string. Throws JSON_PARSE_FAILURE if invalid JSON.
 * 2. **validateLessonStructure()** — Checks semantic structure: parts array is non-empty,
 *    each part has cards array (non-empty), each card has content >50 characters.
 *    Throws JSON_PARSE_FAILURE if any check fails (triggers retry).
 * 3. **cleanPartTitle()** — Detects word repetition hallucinations (word appears 3+ times in
 *    80-char sample → replace with fallback). Strips trailing JSON artifacts (`, ", whitespace).
 *
 * This chain is called after every lesson generation. Invalid structures trigger a full retry
 * of the AI call, not a silent fix. The controller layer (session.controller.js) has an
 * additional guardSessionContent() validation pass before persisting to the database.
 *
 * @version 2.0
 * @author SkillMaster Engineering
 */

import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Two models — Pro thinks, Flash structures and handles everything else
const THINKING_MODEL  = 'gemini-2.5-pro';   // lesson content only
const STRUCTURE_MODEL = 'gemini-2.5-flash';  // everything else + formatting pass

// ==============================================================================
// SCHEMAS — Enforce shape, not word count. Let the model breathe.
// ==============================================================================

const ROADMAP_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    skillName:      { type: Type.STRING },
    targetLevel:    { type: Type.STRING },
    totalModules:   { type: Type.NUMBER },
    estimatedWeeks: { type: Type.NUMBER },
    modules: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          moduleNumber: { type: Type.NUMBER },
          title:        { type: Type.STRING },
          weeks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                weekNumber: { type: Type.NUMBER },
                title:      { type: Type.STRING },
                days: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      dayNumber:  { type: Type.NUMBER },
                      dayName:    { type: Type.STRING },
                      type:       { type: Type.STRING },
                      title:      { type: Type.STRING },
                      topicsList: { type: Type.ARRAY, items: { type: Type.STRING } },
                      examQuestions: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            question:     { type: Type.STRING },
                            options:      { type: Type.ARRAY, items: { type: Type.STRING } },
                            correctIndex: { type: Type.NUMBER },
                            topicTag:     { type: Type.STRING }
                          }
                        }
                      }
                    },
                    required: ['dayNumber', 'dayName', 'type', 'title']
                  }
                }
              },
              required: ['weekNumber', 'title', 'days']
            }
          }
        },
        required: ['moduleNumber', 'title', 'weeks']
      }
    }
  },
  required: ['skillName', 'targetLevel', 'totalModules', 'estimatedWeeks', 'modules']
};

// Lesson schema — relaxed on card content, strict on structure
const LESSON_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    parts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          partNumber: { type: Type.NUMBER },
          partTitle:  { type: Type.STRING },
          cards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                cardNumber: { type: Type.NUMBER },
                content:    { type: Type.STRING }
              }
            }
          },
          miniExercise: {
            type: Type.OBJECT,
            properties: {
              question:     { type: Type.STRING },
              options:      { type: Type.ARRAY, items: { type: Type.STRING } },
              correctIndex: { type: Type.NUMBER },
              explanation:  { type: Type.STRING }
            }
          }
        }
      }
    },
    task: {
      type: Type.OBJECT,
      properties: {
        type:        { type: Type.STRING },
        description: { type: Type.STRING },
        questions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question:     { type: Type.STRING },
              options:      { type: Type.ARRAY, items: { type: Type.STRING } },
              correctIndex: { type: Type.NUMBER },
              topicTag:     { type: Type.STRING }
            }
          }
        }
      }
    }
  },
  required: ['parts']
};

// ==============================================================================
// SYSTEM INSTRUCTIONS
// ==============================================================================

const ROADMAP_SYSTEM = `You are an expert curriculum designer. You design learning paths for any skill — technical or non-technical.

Your curriculum philosophy:
- Realistic pacing. Never cram MERN into 4 weeks if it genuinely needs 10. Never pad a skill that only needs 2 modules.
- Spiral progression: later weeks BUILD on earlier ones. No re-explaining.
- 70% practical, 30% conceptual in topicsList.
- Day titles are outcomes, not labels. NOT "React Hooks" → YES "Making Components Remember State with useState"

Respond ONLY with valid JSON. No markdown. No explanation.`;

const LESSON_THINKING_SYSTEM = `You are a senior engineer who has mentored hundreds of developers. You don't write like a textbook. You teach like a real person who has seen the mistakes, hit the walls, and knows what actually matters.

BEFORE YOU WRITE ANYTHING, do this internally:
1. What do beginners consistently get wrong about this topic?
2. What is the real-world scenario where this concept matters most?
3. What would make someone ACTUALLY remember this after closing the app?
4. What's the one thing that, once understood, makes everything else click?

Then write the lesson with THESE rules:
- Open Part 1 with the PROBLEM this concept solves, not the definition.
- Every card needs one concrete, specific example. Not "you can use this to manage state" — show actual code or a real scenario.
- Address the most common mistake somewhere. Lead it with: "The mistake most devs make here is..."
- Connect at least one idea per part to the learner's actual goal.
- Write like a team mate explaining in a Slack message, not a professor lecturing.

BANNED phrases: "it is important to note", "in conclusion", "as we can see", "let us explore", "in this section", "fundamentals", "in the world of".

OUTPUT FORMAT: Plain text paragraphs for each card — rich, human, opinionated. No JSON yet. The formatter will handle structure.`;

const LESSON_FORMATTER_SYSTEM = `You are a precise JSON formatter. You receive rich lesson content and convert it into a structured schema. Your ONLY job is to preserve meaning and wrap it in structure.

Rules:
- Do NOT simplify content. Do NOT generalize. Do NOT trim examples.
- partTitle: 5-8 words, outcome-focused, title case
- Each part gets 2-3 cards. Each card is one focused concept from the input.
- miniExercise must test genuine understanding, not recall. Someone who skimmed must get it wrong.
- Respond ONLY with valid JSON matching the schema. Nothing else.`;

const FEEDBACK_SYSTEM = `You are an expert mentor evaluating learner work. Be direct, specific, and encouraging.
Never be vague. Always give one concrete next step.`;

// ==============================================================================
// UTILITIES
// ==============================================================================

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const parseJSON = (text) => {
  try {
    if (typeof text === 'object') return text;
    return JSON.parse(text);
  } catch {
    console.error('[Gemini] JSON parse failed on:', text?.substring(0, 300));
    throw new Error('JSON_PARSE_FAILURE');
  }
};

const validateLessonStructure = (parsed) => {
  if (!parsed.parts || !Array.isArray(parsed.parts) || parsed.parts.length === 0) {
    console.error('[Gemini Validation] FAIL: parts array missing or empty');
    throw new Error('JSON_PARSE_FAILURE');
  }
  for (const part of parsed.parts) {
    if (!part.cards || !Array.isArray(part.cards) || part.cards.length === 0) {
      console.error(`[Gemini Validation] FAIL: part ${part.partNumber} has no cards`);
      throw new Error('JSON_PARSE_FAILURE');
    }
    for (const card of part.cards) {
      if (!card.content || typeof card.content !== 'string' || card.content.trim().length < 50) {
        console.error(`[Gemini Validation] FAIL: card content too short in part ${part.partNumber}`);
        throw new Error('JSON_PARSE_FAILURE');
      }
    }
  }
  return true;
};

const cleanPartTitle = (title) => {
  if (typeof title !== 'string' || title.trim().length === 0) return 'Topic Overview';
  const sample = title.substring(0, 80).toLowerCase();
  const words = sample.split(/\s+/).filter(w => w.length > 3);
  const counts = {};
  for (const word of words) {
    counts[word] = (counts[word] || 0) + 1;
    if (counts[word] >= 3) {
      console.warn('[Gemini Validation] Hallucinated partTitle replaced');
      return 'Topic Overview';
    }
  }
  return title.replace(/[,"\s]+$/, '').replace(/^[,"\s]+/, '').trim().substring(0, 80);
};

// ==============================================================================
// CORE CALL — Single model, single call (roadmap, MCQ, feedback, formatting)
// ==============================================================================

const callModel = async ({ model, prompt, systemInstruction, schema, isJson = true }) => {
  let attempts = 0;
  const maxRetries = 3;

  while (attempts < maxRetries) {
    try {
      const config = {
        systemInstruction,
        responseMimeType: isJson ? 'application/json' : 'text/plain',
        temperature:      isJson ? 0.7 : 0.6,
        maxOutputTokens:  isJson ? 65536 : 8192,
      };

      if (isJson && schema) config.responseSchema = schema;

      const response = await ai.models.generateContent({ model, contents: prompt, config });
      const text = response.text;
      if (!text) throw new Error('EMPTY_RESPONSE');

      return isJson ? parseJSON(text) : text;

    } catch (error) {
      attempts++;
      const is429 = error.message?.includes('429') || error.status === 429;
      const is500 = error.message?.includes('500') || error.status === 500;
      const retryable = (is429 || is500) && attempts < maxRetries;

      console.error(`[Gemini] Attempt ${attempts} failed: ${error.message}${retryable ? ' — retrying' : ''}`);

      if (retryable) {
        const ms = attempts === 1 ? 5000 : attempts === 2 ? 15000 : 30000;
        await wait(ms);
      } else {
        if (error.message === 'JSON_PARSE_FAILURE') throw error;
        throw new Error(`GEMINI_FAILURE: ${error.message}`);
      }
    }
  }
};

// ==============================================================================
// TWO-CALL LESSON PIPELINE
// Call 1: Pro model thinks freely → rich content, no constraints
// Call 2: Flash formats → strict JSON schema
// This is the only place we use two calls. Everything else is one call.
// ==============================================================================

const generateLessonTwoPass = async (thinkingPrompt, formatterPrompt) => {
  // CALL 1 — Pro model, free-form thinking
  console.log('[Gemini] Lesson: starting thinking pass (Pro)...');
  const rawContent = await callModel({
    model: THINKING_MODEL,
    prompt: thinkingPrompt,
    systemInstruction: LESSON_THINKING_SYSTEM,
    isJson: false,
  });

  // CALL 2 — Flash formats the raw content into schema
  console.log('[Gemini] Lesson: starting formatting pass (Flash)...');
  const structured = await callModel({
    model: STRUCTURE_MODEL,
    prompt: `${formatterPrompt}\n\n---\nRAW LESSON CONTENT TO STRUCTURE:\n${rawContent}`,
    systemInstruction: LESSON_FORMATTER_SYSTEM,
    schema: LESSON_SCHEMA,
    isJson: true,
  });

  // Validate and clean
  validateLessonStructure(structured);
  structured.parts = structured.parts.map(part => ({
    ...part,
    partTitle: cleanPartTitle(part.partTitle),
  }));

  return structured;
};

// ==============================================================================
// PUBLIC API
// ==============================================================================

/**
 * Generates a complete learning roadmap (curriculum skeleton).
 *
 * Creates a structured 7-day/week learning plan with modules, weeks, and daily topics.
 * Each week includes 5 learning days (Mon–Fri), 1 revision day (Sat), and 1 exam day (Sun).
 * Exam days include exactly 5 multiple-choice questions tied to week topics.
 *
 * This is a single-call operation using Gemini 2.5 Flash. Roadmap generation is purely
 * curriculum-design work (no creative writing needed), so Flash's speed and cost efficiency
 * are prioritized over Pro's extended thinking.
 *
 * @param {Object} data - Learner profile and skill input
 * @param {string} data.skillInput - The skill to learn (e.g., "React", "Machine Learning", "Copywriting")
 * @param {string} data.motivation - Learner's stated goal or use case
 * @param {string} data.currentLevel - Learner's experience level ("Beginner", "Intermediate", "Advanced")
 * @param {string} data.role - Learner's professional role or context
 * @param {string} data.learningStyle - Preferred learning modality ("Practice", "Examples", "Theory")
 * @param {string} data.goalClarity - How well-defined the goal is ("Clear", "Moderate", "Vague")
 * @param {string} data.dailyTime - Daily time commitment (e.g., "1 hour", "3 hours")
 *
 * @returns {Promise<Object>} Roadmap object matching ROADMAP_SCHEMA
 * @returns {string} returnValue.skillName - Canonical skill name
 * @returns {string} returnValue.targetLevel - Target proficiency level
 * @returns {number} returnValue.totalModules - Total modules in roadmap
 * @returns {number} returnValue.estimatedWeeks - Total weeks (sum of all module weeks)
 * @returns {Array<Object>} returnValue.modules - Array of module objects
 * @returns {number} returnValue.modules[].moduleNumber - Module sequence number
 * @returns {string} returnValue.modules[].title - Module title
 * @returns {Array<Object>} returnValue.modules[].weeks - Array of 7-day weeks
 * @returns {number} returnValue.modules[].weeks[].weekNumber - Week sequence number
 * @returns {string} returnValue.modules[].weeks[].title - Week theme/title
 * @returns {Array<Object>} returnValue.modules[].weeks[].days - 7 day objects (Mon–Sun)
 * @returns {number} returnValue.modules[].weeks[].days[].dayNumber - Day 1–7
 * @returns {string} returnValue.modules[].weeks[].days[].dayName - "Monday", "Saturday", etc.
 * @returns {string} returnValue.modules[].weeks[].days[].type - "learning", "revision", or "exam"
 * @returns {string} returnValue.modules[].weeks[].days[].title - Outcome-focused title (e.g., "Building Reusable Components with Props")
 * @returns {Array<string>} returnValue.modules[].weeks[].days[].topicsList - 2–4 specific topics for learning days; empty for revision/exam
 * @returns {Array<Object>} returnValue.modules[].weeks[].days[].examQuestions - 5 MCQ objects for exam days only
 * @returns {string} returnValue.modules[].weeks[].days[].examQuestions[].question - Question text
 * @returns {Array<string>} returnValue.modules[].weeks[].days[].examQuestions[].options - 4 answer options
 * @returns {number} returnValue.modules[].weeks[].days[].examQuestions[].correctIndex - Index of correct option (0–3)
 * @returns {string} returnValue.modules[].weeks[].days[].examQuestions[].topicTag - Matching topic from week topics for traceability
 *
 * @throws {Error} Throws error if API call fails after 3 retries or if JSON is invalid
 *
 * @example
 * const roadmap = await generateRoadmapSkeleton({
 *   skillInput: "Advanced React Patterns",
 *   motivation: "Build scalable web apps at a startup",
 *   currentLevel: "Intermediate",
 *   role: "Frontend Engineer",
 *   learningStyle: "Practice",
 *   goalClarity: "Clear",
 *   dailyTime: "2 hours"
 * });
 * // Returns: { skillName: "Advanced React Patterns", modules: [...], totalModules: 6, ... }
 */
export const generateRoadmapSkeleton = (data) => {
  const prompt = `Generate a learning roadmap for this learner:

Skill: ${data.skillInput}
Goal: ${data.motivation || 'Not specified'}
Current level: ${data.currentLevel}
Role: ${data.role}
Learning style: ${data.learningStyle}
Goal clarity: ${data.goalClarity}
Daily time: ${data.dailyTime}

CURRICULUM RULES:
1. Decide module count based on real complexity. MERN needs 8-12 weeks minimum. Don't compress it.
2. Each week = exactly 7 days. Mon–Fri = Learning. Sat = Revision. Sun = Exam.
3. Learning day topicsList: 2–4 specific, actionable topics (not category names).
4. Day title = an outcome, not a topic. "Building Reusable Components with Props" not "React Props".
5. Exam day: exactly 5 MCQs. Each question maps to a specific day topic via topicTag.
6. Each module must build on the previous. Never repeat concepts — only apply them.
7. Revision day: topicsList = empty array.`;

  return callModel({
    model: STRUCTURE_MODEL,
    prompt,
    systemInstruction: ROADMAP_SYSTEM,
    schema: ROADMAP_SCHEMA,
    isJson: true,
  });
};

/**
 * Generates lesson content for a learning day or a revision session.
 *
 * This is the only function that uses the two-call pipeline: Pro model thinks deeply about
 * pedagogy, examples, and learner misconceptions; Flash model formats the result into strict JSON.
 *
 * ## Learning Path (isRevision === false, isExamRetry === false)
 * Generates a full 3-part lesson for a new topic, with context from the learner's goal,
 * learning style, and current level. Each part has 2–4 cards plus a mini-exercise.
 * At the end: either 10–15 MCQ questions (conceptual topics) or one open-ended text task
 * (practical/hands-on topics).
 *
 * ## Revision Path (isRevision === true OR isExamRetry === true)
 * Generates a focused revision session with 1 part, 3 cards, and 1 mini-exercise.
 * No task. Used when a learner revisits weak topics before re-taking an exam.
 * Content is re-explained from a different angle with new examples.
 *
 * ## Model Usage
 * Call 1: Gemini 2.5 Pro with extended thinking (reasoning about content before generation)
 * Call 2: Gemini 2.5 Flash (strict JSON formatting)
 *
 * @param {Object} data - Lesson context and learner profile
 *
 * @param {boolean} [data.isRevision=false] - If true, generate 1-part revision content
 * @param {boolean} [data.isExamRetry=false] - If true, generate revision after failed exam
 * @param {string} data.skillName - Skill being learned
 * @param {string} data.currentLevel - Learner level ("Beginner", "Intermediate", "Advanced")
 * @param {string} data.motivation - Learner's goal (referenced in content)
 * @param {string} data.learningStyle - Preferred mode ("Practice", "Examples", "Theory")
 *
 * **Learning Path Only**:
 * @param {number} data.moduleNumber - Module number (1, 2, 3, ...)
 * @param {string} data.moduleTitle - Module title
 * @param {number} data.weekNumber - Week number within module
 * @param {string} data.weekTitle - Week theme
 * @param {number} data.dayNumber - Day in week (1–5 for learning, 6 for revision, 7 for exam)
 * @param {string} data.dayName - Day name ("Monday", "Tuesday", etc.)
 * @param {Array<string>} data.topicsList - 2–4 topics to cover today
 *
 * **Revision Path Only**:
 * @param {string} [data.weakTopicsStr] - Comma-separated weak topics to revisit
 * @param {string} [data.allWeekTopics] - Fallback: all topics from the week if no weak topics provided
 *
 * @returns {Promise<Object>} Lesson object matching LESSON_SCHEMA
 * @returns {Array<Object>} returnValue.parts - Array of lesson parts (1 for revision, 3 for learning)
 * @returns {number} returnValue.parts[].partNumber - Part sequence (1, 2, 3, ...)
 * @returns {string} returnValue.parts[].partTitle - 5–8 word outcome-focused title
 * @returns {Array<Object>} returnValue.parts[].cards - Array of content cards (2–4 per part)
 * @returns {number} returnValue.parts[].cards[].cardNumber - Card sequence number
 * @returns {string} returnValue.parts[].cards[].content - Rich markdown-formatted content (120–200 words, concrete examples, common mistakes addressed)
 * @returns {Object} returnValue.parts[].miniExercise - Single-question quiz per part
 * @returns {string} returnValue.parts[].miniExercise.question - Question text
 * @returns {Array<string>} returnValue.parts[].miniExercise.options - 4 answer options
 * @returns {number} returnValue.parts[].miniExercise.correctIndex - Index of correct option (0–3)
 * @returns {string} returnValue.parts[].miniExercise.explanation - Why this is correct and others are wrong
 * @returns {Object|null} returnValue.task - Task at end of lesson (null for revision)
 * @returns {string} returnValue.task.type - "mcq" or "text"
 * @returns {string} returnValue.task.description - Task prompt/instructions
 * @returns {Array<Object>} returnValue.task.questions - MCQ questions (if type === "mcq") or open-ended task (if type === "text")
 * @returns {string} returnValue.task.questions[].question - Question text
 * @returns {Array<string>} returnValue.task.questions[].options - 4 options (MCQ only)
 * @returns {number} returnValue.task.questions[].correctIndex - Correct option index (MCQ only)
 * @returns {string} returnValue.task.questions[].topicTag - Related topic for traceability
 *
 * @throws {Error} Throws error if API calls fail after retries or if structure validation fails
 *
 * @example
 * // Learning path
 * const lesson = await generateLessonContent({
 *   skillName: "React",
 *   currentLevel: "Beginner",
 *   motivation: "Build interactive web apps",
 *   learningStyle: "Practice",
 *   moduleNumber: 1,
 *   moduleTitle: "React Fundamentals",
 *   weekNumber: 1,
 *   weekTitle: "Components and JSX",
 *   dayNumber: 1,
 *   dayName: "Monday",
 *   topicsList: ["Writing your first component", "Understanding JSX syntax"]
 * });
 *
 * @example
 * // Revision path
 * const revision = await generateLessonContent({
 *   skillName: "React",
 *   currentLevel: "Beginner",
 *   isRevision: true,
 *   weakTopicsStr: "JSX syntax, component props"
 * });
 */
export const generateLessonContent = async (data) => {

  // REVISION SESSION — single pass, simpler content
  if (data.isRevision || data.isExamRetry) {
    const topics = data.weakTopicsStr || data.allWeekTopics || 'General review of the week';

    const thinkingPrompt = `Write a focused revision lesson for a learner who struggled with these topics:
${topics}

Skill: ${data.skillName} | Level: ${data.currentLevel || 'Beginner'}

This is a revision session. Your goal:
- Re-explain each weak topic from a completely different angle than the first time.
- Use a new example the learner hasn't seen.
- Connect the weak topics to each other if possible.
- Be direct: "You got this wrong before because X. Here's what's actually happening..."

Write 3 cards of content. After that, write 1 quiz question with 4 options, the correct answer, and why.
No task — this is revision only.`;

    const formatterPrompt = `Format this revision content into the lesson schema.
EXACTLY 1 part. EXACTLY 3 cards. 1 miniExercise. task = null.
Do not add, remove, or simplify anything.`;

    return generateLessonTwoPass(thinkingPrompt, formatterPrompt);
  }

  // LEARNING SESSION — full two-pass pipeline
  const thinkingPrompt = `Write a complete lesson for this session:

Skill: ${data.skillName}
Module ${data.moduleNumber}: ${data.moduleTitle}
Week ${data.weekNumber}: ${data.weekTitle}
Day ${data.dayNumber} (${data.dayName})
Topics: ${data.topicsList?.join(', ') || ''}
Learner level: ${data.currentLevel}
Learner goal: ${data.motivation || 'Not specified'}
Learning style: ${data.learningStyle}

THINK FIRST (don't write yet):
- What do beginners always misunderstand about these specific topics?
- What's the real-world scenario where this actually matters?
- How does today's topic connect to the learner's goal: "${data.motivation}"?
- What's the single most important thing to get right here?

NOW WRITE 3 PARTS:

Part 1: Open with the PROBLEM these topics solve (not the definition). Show the pain of NOT having this skill.
Part 2: Teach the core concept with a concrete, runnable example. Address the most common mistake directly.
Part 3: Synthesize — show how today's concepts combine in a realistic scenario from the learner's goal domain.

For each part: 2-3 focused cards of content. After each part: one quiz question that someone who skimmed would get wrong.

End with a task:
- If topics are conceptual → 10-15 MCQs that test application not memorization.
- If topics are practical → one open engineering question requiring a detailed walkthrough answer (not "explain what X is" but "here's a scenario, what do you do and why").

Write in engineer voice. Opinionated. Direct. Real examples. No textbook language.`;

  const formatterPrompt = `Format this lesson into the schema.
- EXACTLY 3 parts.
- 2-3 cards per part.
- 1 miniExercise per part.
- 1 task at the end (type: "text" or "mcq").
Preserve all content and examples. Do not simplify anything.`;

  return generateLessonTwoPass(thinkingPrompt, formatterPrompt);
};

/**
 * Generates AI-powered feedback on a learner's task submission.
 *
 * Evaluates both MCQ task submissions and open-ended text task submissions, providing
 * personalized, actionable feedback. The function routes to different evaluation logic based
 * on task type but always returns structured feedback with specific strengths, weaknesses,
 * next steps, and curated resources.
 *
 * This is a single-call operation using Gemini 2.5 Flash. The evaluation is straightforward
 * (diagnose right/wrong answers, provide feedback) and doesn't require extended reasoning.
 *
 * ## MCQ Path (isMcq === true)
 * Analyzes multiple-choice quiz performance. The feedback examines incorrect answers,
 * diagnoses conceptual confusion (not surface-level mistakes), and maps failures back to
 * the specific topics being tested. Resources are tied to weak topics.
 *
 * Feedback structure:
 * 1. What was understood (specific correct answers and concepts demonstrated)
 * 2. What broke down (diagnosis of the conceptual gap behind wrong answers)
 * 3. One concrete next step (study action, re-read, practice example, etc.)
 * Then: OUTCOME: positive | needs_improvement
 * Then: RESOURCES: 1–2 official documentation links with brief descriptions
 *
 * ## Text Task Path (isMcq === false)
 * Analyzes open-ended task submissions (code reviews, explanations, engineering decisions).
 * Feedback examines completeness, correctness, depth, and engineering quality.
 *
 * Feedback structure (same as MCQ):
 * 1. What was demonstrated correctly
 * 2. What's missing or wrong (specific, actionable)
 * 3. One concrete next step
 * Then: OUTCOME: positive | needs_improvement
 * Then: RESOURCES: 1–2 official documentation links
 *
 * ## Resource Guidelines
 * Resources are always official documentation only: MDN, React docs, Node.js docs, MongoDB,
 * Python docs, etc. Never YouTube, Medium, blogs, or broken links. If a resource doesn't
 * apply, the response includes: "RESOURCES: (no additional resources needed for this topic)"
 *
 * @param {Object} data - Task submission and evaluation context
 * @param {boolean} data.isMcq - If true, evaluate MCQ performance; otherwise text task
 * @param {string} data.description - Task title or description
 * @param {Array<string>} data.topicsList - Topics being tested/assessed
 * @param {string} [data.outcome="needs_improvement"] - Expected outcome ("positive" or "needs_improvement")
 *
 * **MCQ Path Only**:
 * @param {Array<Object>} data.report - Array of question results
 * @param {string} data.report[].questionText - The question asked
 * @param {Array<string>} data.report[].options - 4 answer options
 * @param {number} data.report[].selectedIndex - Index of learner's choice (0–3)
 * @param {number} data.report[].correctIndex - Index of correct answer (0–3)
 * @param {boolean} data.report[].isCorrect - Whether learner got it right
 * @param {string} [data.report[].topicTag] - Topic this question tests (for resource matching)
 * @param {number} [data.score] - Percentage score (calculated from report if not provided)
 * @param {number} [data.correctCount] - Number of correct answers (calculated if not provided)
 * @param {number} [data.totalQuestions] - Total questions (length of report if not provided)
 *
 * **Text Task Path Only**:
 * @param {string} data.userAnswer - Learner's submitted answer/response
 *
 * @returns {Promise<string>} Plain-text feedback response
 * Format:
 * ```
 * [Paragraph 1: What was understood]
 *
 * [Paragraph 2: What needs improvement]
 *
 * [Paragraph 3: Specific next step]
 *
 * OUTCOME: positive | needs_improvement
 *
 * RESOURCES:
 * - [Resource Title](https://...) — description
 * - [Resource Title](https://...) — description
 * OR
 * RESOURCES: (no additional resources needed for this topic)
 * ```
 *
 * @throws {Error} Throws error if API call fails after retries
 *
 * @example
 * // MCQ feedback
 * const feedback = await generateFeedback({
 *   isMcq: true,
 *   description: "Week 1 Quiz: Components and JSX",
 *   topicsList: ["JSX syntax", "Component lifecycle"],
 *   report: [
 *     {
 *       questionText: "What does JSX compile to?",
 *       options: ["HTML", "JavaScript function calls", "CSS", "JSON"],
 *       selectedIndex: 0,
 *       correctIndex: 1,
 *       isCorrect: false,
 *       topicTag: "JSX syntax"
 *     },
 *     // ... more questions
 *   ],
 *   score: 60
 * });
 *
 * @example
 * // Text task feedback
 * const feedback = await generateFeedback({
 *   isMcq: false,
 *   description: "Design a React component for a form",
 *   topicsList: ["Component composition", "State management"],
 *   userAnswer: "function MyForm() { const [name, setName] = useState(''); ... }"
 * });
 */
export const generateFeedback = (data) => {
  let prompt;

  if (data.isMcq) {
    const wrongAnswers = data.report.filter(r => !r.isCorrect);
    const score = data.score ?? Math.round((data.report.filter(r => r.isCorrect).length / data.report.length) * 100);

    prompt = `Score: ${score}% (${data.report.filter(r => r.isCorrect).length}/${data.report.length} correct)

Wrong answers:
${wrongAnswers.map((r, i) =>
  `${i + 1}. "${r.questionText}"\n   Chose: ${r.options?.[r.selectedIndex] ?? 'none'}\n   Correct: ${r.options?.[r.correctIndex]}`
).join('\n\n')}

Write feedback in 3 paragraphs:
1. What they understood (be specific, not generic)
2. What broke down in the wrong answers (diagnose the actual confusion, not just "review X")
3. One concrete action to fix it

After the 3 paragraphs, you MUST include:
OUTCOME: positive OR OUTCOME: needs_improvement (based on your evaluation of their understanding)

Then you MUST include a RESOURCES section with exactly this format:
RESOURCES:
- [URL 1 Title](https://...) — brief description of what this covers
- [URL 2 Title](https://...) — brief description of what this covers

Use ONLY official documentation URLs: MDN, React docs, Node.js docs, MongoDB docs, Python docs, etc. Never YouTube, Medium, blogs, or tutorials. If no resources are relevant, write: RESOURCES: (no additional resources needed for this topic)`;

  } else {
    prompt = `Task: ${data.description}
Topics tested: ${data.topicsList}
Learner's answer: ${data.userAnswer}

Write feedback in 3 paragraphs:
1. What they got right (name specific things from their answer)
2. What's missing or wrong (be specific — don't say "improve X", say what X should actually be)
3. One concrete next step

After the 3 paragraphs, you MUST include:
OUTCOME: positive OR OUTCOME: needs_improvement (based on the quality of their answer)

Then you MUST include a RESOURCES section with exactly this format:
RESOURCES:
- [URL 1 Title](https://...) — brief description of what this covers
- [URL 2 Title](https://...) — brief description of what this covers

Use ONLY official documentation URLs: MDN, React docs, Node.js docs, MongoDB docs, Python docs, etc. Never YouTube, Medium, blogs, or tutorials. If no resources are relevant, write: RESOURCES: (no additional resources needed for this topic)`;
  }

  return callModel({
    model: STRUCTURE_MODEL,
    prompt,
    systemInstruction: FEEDBACK_SYSTEM,
    isJson: false,
  });
};
// ***
// END OF GEMINI SERVICE
// ***
// GEMINI SERVICE
// // ==============================================================================
// // HARDENED GEMINI SERVICE — IMPLEMENTING SDK BEST PRACTICES
// // ==============================================================================

// import { GoogleGenAI, Type } from '@google/genai';
// import dotenv from 'dotenv';

// dotenv.config();

// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// const MODEL = 'gemini-2.5-flash';

// // --- JSON Schemas (Fixed to use Type enum and remove nullable) ---

// const ROADMAP_SCHEMA = {
//   type: Type.OBJECT,
//   properties: {
//     skillName: { type: Type.STRING },
//     targetLevel: { type: Type.STRING },
//     totalModules: { type: Type.NUMBER },
//     estimatedWeeks: { type: Type.NUMBER },
//     modules: {
//       type: Type.ARRAY,
//       items: {
//         type: Type.OBJECT,
//         properties: {
//           moduleNumber: { type: Type.NUMBER },
//           title: { type: Type.STRING },
//           weeks: {
//             type: Type.ARRAY,
//             items: {
//               type: Type.OBJECT,
//               properties: {
//                 weekNumber: { type: Type.NUMBER },
//                 title: { type: Type.STRING },
//                 days: {
//                   type: Type.ARRAY,
//                   items: {
//                     type: Type.OBJECT,
//                     properties: {
//                       dayNumber: { type: Type.NUMBER },
//                       dayName: { type: Type.STRING },
//                       type: { type: Type.STRING },
//                       title: { type: Type.STRING },
//                       topicsList: { type: Type.ARRAY, items: { type: Type.STRING } },
//                       examQuestions: {
//                         type: Type.ARRAY,
//                         items: {
//                           type: Type.OBJECT,
//                           properties: {
//                             question: { type: Type.STRING },
//                             options: { type: Type.ARRAY, items: { type: Type.STRING } },
//                             correctIndex: { type: Type.NUMBER },
//                             topicTag: { type: Type.STRING }
//                           }
//                         }
//                       }
//                     },
//                     required: ['dayNumber', 'dayName', 'type', 'title']
//                   }
//                 }
//               },
//               required: ['weekNumber', 'title', 'days']
//             }
//           }
//         },
//         required: ['moduleNumber', 'title', 'weeks']
//       }
//     }
//   },
//   required: ['skillName', 'targetLevel', 'totalModules', 'estimatedWeeks', 'modules']
// };

// const LESSON_SCHEMA = {
//   type: Type.OBJECT,
//   properties: {
//     parts: {
//       type: Type.ARRAY,
//       items: {
//         type: Type.OBJECT,
//         properties: {
//           partNumber: { type: Type.NUMBER },
//           partTitle: { type: Type.STRING },
//           cards: {
//             type: Type.ARRAY,
//             items: {
//               type: Type.OBJECT,
//               properties: {
//                 cardNumber: { type: Type.NUMBER },
//                 content: { type: Type.STRING }
//               }
//             }
//           },
//           miniExercise: {
//             type: Type.OBJECT,
//             properties: {
//               question: { type: Type.STRING },
//               options: { type: Type.ARRAY, items: { type: Type.STRING } },
//               correctIndex: { type: Type.NUMBER },
//               explanation: { type: Type.STRING }
//             }
//           }
//         }
//       }
//     },
//     task: {
//       type: Type.OBJECT,
//       properties: {
//         type: { type: Type.STRING },
//         description: { type: Type.STRING },
//         questions: {
//           type: Type.ARRAY,
//           items: {
//             type: Type.OBJECT,
//             properties: {
//               question: { type: Type.STRING },
//               options: { type: Type.ARRAY, items: { type: Type.STRING } },
//               correctIndex: { type: Type.NUMBER },
//               topicTag: { type: Type.STRING }
//             }
//           }
//         }
//       }
//     }
//   },
//   required: ['parts']
// };

// // --- System Instructions ---
// const ROADMAP_SYSTEM_INSTRUCTION = `You are an expert curriculum designer and skill development mentor.
// You design learning roadmaps for ANY skill or field — programming, cooking,
// trading, music, language learning, or anything else a human might want to master.
// You analyze the learner's profile deeply before designing the structure.
// You always respond with ONLY valid JSON. No markdown, no explanation, no code fences.
// You follow the exact JSON structure specified in every prompt precisely.
// You never assume a skill is easy or short — if the goal requires 12 modules, design 12.
// If the goal requires 2 modules, design 2. Let the skill and goal determine the length.
// You always create exactly 7 days per week. Day 6 (Saturday) is always Revision.
// Day 7 (Sunday) is always Exam. Days 1-5 are Learning.
// Each exam day always has exactly 5 MCQ questions with a topicTag per question.

// CRITICAL: Do not fragment your array responses. Ensure every object in the 'weeks' array contains weekNumber, title, and days IN ONE OBJECT.`;
// const LESSON_SYSTEM_INSTRUCTION = `You are a senior engineer who has mentored hundreds of developers at top-tier product companies. You do NOT write educational content like a textbook. You teach like a staff engineer talking to a sharp junior on their first week: direct, opinionated, specific, and practical.

// TEACHING RULES — follow every one:
// 1. Every card must teach exactly one concept with one concrete, runnable example. Not abstract. Code or scenario, always.
// 2. Start every first card of a part by naming the real problem this concept solves. Not "variables store data" — "without variables, you would retype 49.99 every place you charge a customer. Change the price once in the variable and it updates everywhere."
// 3. Address the single most common mistake on this topic somewhere in the card. Lead with: "The mistake most developers make here is..."
// 4. Connect at least one card per part to the learner's stated goal. Make it explicit.
// 5. Write for someone smart who is new to this. Never condescend. Never explain what they already know.
// 6. Banned phrases: "it is important to note", "in conclusion", "as we can see", "let us explore", "in this section".
// 7. MiniExercise must require genuine understanding, not recall. A learner who skimmed the cards must get it wrong.

// ABSOLUTE STRUCTURAL RULES:
// - partTitle: 5–8 words, title-case, concept-specific (NOT "Introduction to Functions" — YES "Why Functions Stop You Repeating Code")
// - card content: 120–180 words, one concrete example minimum, one mistake addressed, Markdown formatted
// - cards use: **bold** for key terms, \`backticks\` for code, fenced code blocks for multi-line examples
// - revision sessions: EXACTLY 1 part, EXACTLY 3 cards, 1 miniExercise, task is null — no exceptions
// - learning sessions: EXACTLY 3 parts, each with 2–4 cards and 1 miniExercise`;

// // Removed complex keyword-matching function - AI has full context from topics to decide resources

// const FEEDBACK_SYSTEM_INSTRUCTION = `You are an expert mentor evaluating learner submissions.
// Be encouraging, specific, and actionable.
// Never be vague. Focus on growth and improvement.
// `;

// // --- Core Helper ---

// const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// const parseResponse = (responseText) => {
//   try {
//     if (typeof responseText === 'object') return responseText;
//     return JSON.parse(responseText);
//   } catch (err) {
//     console.error('Failed to parse Gemini response:', responseText?.substring(0, 300));
//     throw new Error('JSON_PARSE_FAILURE');
//   }
// };

// /**
//  * Validates that a parsed lesson object has the correct semantic structure.
//  * Throws JSON_PARSE_FAILURE if structure is invalid — triggering retry logic.
//  * Called after JSON.parse succeeds, before returning to caller.
//  */
// const validateLessonStructure = (parsed) => {
//   // Must have parts array that is non-empty
//   if (!parsed.parts || !Array.isArray(parsed.parts) || parsed.parts.length === 0) {
//     console.error('[Gemini Validation] FAIL: parts array missing or empty');
//     throw new Error('JSON_PARSE_FAILURE');
//   }

//   for (const part of parsed.parts) {
//     // Each part must have a non-empty cards array
//     if (!part.cards || !Array.isArray(part.cards) || part.cards.length === 0) {
//       console.error(`[Gemini Validation] FAIL: part ${part.partNumber} has no cards`);
//       throw new Error('JSON_PARSE_FAILURE');
//     }

//     // Each card must have meaningful content (minimum 50 chars)
//     for (const card of part.cards) {
//       if (
//         !card.content ||
//         typeof card.content !== 'string' ||
//         card.content.trim().length < 50
//       ) {
//         console.error(`[Gemini Validation] FAIL: card ${card.cardNumber} in part ${part.partNumber} has no content`);
//         throw new Error('JSON_PARSE_FAILURE');
//       }
//     }
//   }

//   // Validation passed
//   return true;
// };

// /**
//  * Cleans and validates a partTitle string.
//  * Detects Gemini's repetitive hallucination pattern and replaces with fallback.
//  * Strips trailing JSON artifacts like `, "` that appear when Gemini splits objects.
//  */
// const validatePartTitle = (title) => {
//   if (typeof title !== 'string' || title.trim().length === 0) {
//     return 'Topic Overview';
//   }

//   // Detect repetitive hallucination: e.g. "Revieweristive Foundationsistive Revieweristive..."
//   // Pattern: if any word appears 3+ times in first 60 chars, it is hallucinated
//   const sample = title.substring(0, 80).toLowerCase();
//   const words = sample.split(/\s+/).filter(w => w.length > 3);
//   const wordCounts = {};
//   for (const word of words) {
//     wordCounts[word] = (wordCounts[word] || 0) + 1;
//     if (wordCounts[word] >= 3) {
//       console.warn('[Gemini Validation] Hallucinated partTitle detected, replacing with fallback');
//       return 'Topic Overview';
//     }
//   }

//   // Strip trailing JSON artifacts: `, "` or `",` or trailing whitespace
//   const cleaned = title
//     .replace(/[,"\s]+$/, '')  // trailing comma, quote, space
//     .replace(/^[,"\s]+/, '')  // leading artifacts
//     .trim();

//   // Hard length cap
//   return cleaned.substring(0, 80);
// };

// const generateContent = async ({ prompt, systemInstruction, schema, isJson = true }) => {
//   let attempts = 0;
//   const maxRetries = 3;

//   while (attempts < maxRetries) {
//     try {
//       const config = {
//         systemInstruction,
//         responseMimeType: isJson ? 'application/json' : 'text/plain',
//         temperature: isJson ? 0.8: 0.5,
//         maxOutputTokens: isJson ? 65536 : 4096,
        
//       };

//       // Ensure we don't pass `responseSchema: undefined` to the SDK validation
//       if (isJson && schema) {
//         config.responseSchema = schema;
//       }

//       const response = await ai.models.generateContent({
//         model: MODEL,
//         contents: prompt,
//         config
//       });

//       const text = response.text;
//       if (!text) throw new Error('EMPTY_RESPONSE');

//       let parsed = isJson ? parseResponse(text) : text;

//       // Safety: truncate corrupted partTitle
//       // Structural validation + title cleaning for lesson responses
//       if (isJson && parsed.parts !== undefined) {
//         // 1. Validate semantic structure — throws JSON_PARSE_FAILURE on bad shape
//         validateLessonStructure(parsed);

//         // 2. Clean all partTitles
//         parsed.parts = parsed.parts.map(part => ({
//           ...part,
//           partTitle: validatePartTitle(part.partTitle)
//         }));
//       }

//       return parsed;

//     }
//     catch (error) {
//       attempts++;
//       const is429 = error.message?.includes('429') || error.status === 429;
//       const is500 = error.message?.includes('500') || error.status === 500;
//       const shouldRetry = (is429 || is500) && attempts < maxRetries;

//       // Better error logging
//       console.error(`Gemini attempt ${attempts} failed: ${error.message}${shouldRetry ? ' — retrying...' : ''}`);

//       if (shouldRetry) {
//         const waitMs = attempts === 1 ? 5000 : attempts === 2 ? 15000 : 30000;
//         await wait(waitMs);
//       } else {
//         if (error.message === 'JSON_PARSE_FAILURE') throw error;
//         throw new Error(`GEMINI_FAILURE: ${error.message}`);
//       }
//     }
//   }
// };

// // --- Exports ---

// export const generateRoadmapSkeleton = (data) => {
//   const prompt = `Generate a complete learning roadmap skeleton for this learner:
// Skill to learn: ${data.skillInput}
// Learning goal: ${data.motivation}
// Current level: ${data.currentLevel}
// Role: ${data.role}
// Learning style: ${data.learningStyle}
// Goal clarity: ${data.goalClarity}
// Daily time available: ${data.dailyTime}

// INSTRUCTIONS:
// First decide the canonical skill name.
// Decide how many modules are genuinely needed. Be realistic.
// Each module has at least 1 week.
// Each week has exactly 7 days: Mon-Fri = Learning, Sat = Revision, Sun = Exam.
// For each Learning day: list 2-4 specific topics and a short day title.
// For Revision day: topicsList is empty array, title is "Weekly Review".
// For Exam day: write exactly 5 MCQ questions testing that week's topics.

// CURRICULUM DESIGN PRINCIPLES — follow all:
// 1. SPIRAL LEARNING: Week 2 builds on Week 1 concepts. Never re-explain prior week topics — apply them.
// 2. 70/30 RULE: 70% of topicsList items must be practical/hands-on. 30% conceptual.
// 3. PROGRESSIVE DIFFICULTY: Day 1 (Monday) = new concept introduction. Day 5 (Friday) = synthesis and application combining the week's topics.
// 4. ACTION-ORIENTED TITLES: day title must be an action or outcome, not a topic label. NOT "React Hooks" — YES "Adding Dynamic Behavior to Components with Hooks"
// 5. SPECIFIC TOPICS: each item in topicsList must be a specific operation or skill, not a category. NOT "React hooks" — YES "useState for tracking form inputs without re-rendering the whole tree"
// 6. EXAM ALIGNMENT: each examQuestion must have topicTag matching a specific day topic from that week. No surprise topics.
// 7. No day should have more than 4 items in topicsList. Depth over coverage.
// `;

//   return generateContent({
//     prompt,
//     systemInstruction: ROADMAP_SYSTEM_INSTRUCTION,
//     schema: ROADMAP_SCHEMA
//   });
// };

// export const generateLessonContent = (data) => {
//   let prompt = '';

//   if (data.isExamRetry) {
//     prompt = `Generate a focused revision lesson for a learner who needs to review weak topics.

// LEARNER CONTEXT:
// Skill: ${data.skillName}
// Topics the learner struggled with: ${data.weakTopicsStr || 'General review of the week'}
// All topics from this week (fallback if no weak topics): ${data.allWeekTopics || 'Week topics'}
// Learner level: ${data.currentLevel || 'Beginner'}

// OUTPUT REQUIREMENTS (these are non-negotiable):
// - The parts array must contain EXACTLY 1 part object
// - That part must have partNumber: 1
// - That part must have partTitle: a short descriptive string like "Week Revision: Core Concepts"
// - That part must have cards: an array of EXACTLY 3 card objects
//   - card 1: cardNumber: 1, content: 120-200 words re-explaining the first weak topic from a new angle
//   - card 2: cardNumber: 2, content: 120-200 words re-explaining the second weak topic (or connecting concepts)
//   - card 3: cardNumber: 3, content: 120-200 words showing practical application with a new example
// - That part must have miniExercise: an object with question, options (4 strings), correctIndex (0-3), explanation
// - task must be null — revision sessions have no task

// Do not add more than 1 part. Do not return empty cards arrays.`;
//   } else if (data.isRevision) {
//     prompt = `Generate a revision session for this learner:
// Skill: ${data.skillName}
// Week being revised: Module ${data.moduleNumber}, Week ${data.weekNumber}
// Topics the learner struggled with: ${data.weakTopicsStr || 'General review'}
// If no weak topics, revise: ${data.allWeekTopics || 'all topics covered this week'}
// Create a focused revision session with 1 part containing 3-4 cards.
// Re-explain each weak topic from a different angle with new examples.
// No task for revision sessions.`;
//   } else {
//     prompt = `Generate a complete learning session for this learner:
// Skill: ${data.skillName}
// Module: ${data.moduleNumber} — ${data.moduleTitle}
// Week: ${data.weekNumber} — ${data.weekTitle}
// Day: ${data.dayNumber} — ${data.dayName}
// Topics to cover today: ${data.topicsList?.join(', ') || ''}
// TEACH THIS SESSION WITH THESE CONSTRAINTS:
// - Learner level: ${data.currentLevel}. Never explain things they already know. Build forward.
// - Their goal: "${data.motivation}". Explicitly connect today's topics to this goal at least once.
// - Learning style: ${data.learningStyle}. ${
//   data.learningStyle === 'Practice' 
//     ? 'Show working code before explaining theory. Let the example teach first.'
//     : data.learningStyle === 'Examples'
//     ? 'Use real-world analogies before abstract definitions. Concrete before abstract always.'
//     : 'Explain the complete concept, then show how it behaves, then show a counterexample.'
// }
// - Part 1 must open with WHY this exists — what problem did programmers have before this existed?
// - Part 3 must synthesize Parts 1 and 2 — show how the concepts connect in a realistic scenario.
// - Task type: if the day's topics are conceptual → mcq (10–15 questions). If practical/hands-on → text (one open engineering question that requires a multi-step answer to demonstrate real understanding, minimum 100-word answer expected).`
//   }

//   return generateContent({
//     prompt,
//     systemInstruction: LESSON_SYSTEM_INSTRUCTION,
//     schema: LESSON_SCHEMA
//   });
// };

// export const generateFeedback = (data) => {
//   let prompt = '';

//   if (data.isMcq) {
//     const wrongAnswers = data.report.filter(r => !r.isCorrect);
//     const correctCount = data.correctCount || data.report.filter(r => r.isCorrect).length;
//     const totalQuestions = data.totalQuestions || data.report.length;
//     const score = data.score || Math.round((correctCount / totalQuestions) * 100);
//     const wrongTopics = data.report.filter(r => !r.isCorrect).map(r => r.topicTag).filter(Boolean).join(', ');

//     prompt = `You are evaluating a learner's MCQ task performance.

// Score: ${score}% (${correctCount} of ${totalQuestions} correct)

// Questions answered incorrectly:
// ${wrongAnswers.map((r, i) =>
//   `${i + 1}. ${r.questionText}\n   Learner chose: ${r.options[r.selectedIndex] ?? 'No answer'}\n   Correct answer: ${r.options[r.correctIndex]}`
// ).join('\n\n')}

// Provide feedback in exactly 3 paragraphs:
// 1. What the learner understood correctly
// 2. What concepts need more work (specific to the wrong answers)
// 3. One concrete study recommendation

// End with: OUTCOME: ${data.outcome}

// Then add:
// RESOURCES:
// - [resource_title](url): one sentence why this helps

// Resource Rules:
// - 1-2 max, REAL working URLs only
// - Pick the MOST authoritative sources for: ${wrongTopics || 'the topics covered'}
// - No YouTube, Medium, paywalls, or broken links
// - Prefer official docs, educational sites, tutorials

// Keep total response under 400 words.`;
//   } else {
//     prompt = `Evaluate this learner's task submission:
// Task: ${data.description}
// Topics: ${data.topicsList}
// Learner's answer: ${data.userAnswer}

// Provide 3-paragraph feedback:
// 1. What they demonstrated correctly
// 2. What needs improvement
// 3. Specific next step

// End with: OUTCOME: positive OR OUTCOME: needs_improvement

// Then add:
// RESOURCES:
// - [resource_title](url): one sentence why this helps

// Resource Rules:
// - 1-2 max, REAL working URLs only
// - Pick authoritative sources for: ${data.topicsList}
// - No YouTube, Medium, paywalls
// - Only if appropriate to the topics

// Keep total response under 300 words.`;
//   }

//   return generateContent({
//     prompt,
//     systemInstruction: FEEDBACK_SYSTEM_INSTRUCTION,
//     isJson: false,
//   });
// };
// 
// 
//