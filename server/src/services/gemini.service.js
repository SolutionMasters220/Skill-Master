/*
***
// PREVIOUS IMPLEMENTATION (Commented out)
// ==============================================================================
***
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();
console.log(process.env.GEMINI_API_KEY);
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
// --- JSON Schemas (Enforcing Section 2 Data Contracts) ---

const ROADMAP_SCHEMA = {
  type: 'OBJECT',
  properties: {
    skillName: { type: 'STRING' },
    targetLevel: { type: 'STRING' },
    totalModules: { type: 'NUMBER' },
    estimatedWeeks: { type: 'NUMBER' },
    modules: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          moduleNumber: { type: 'NUMBER' },
          title: { type: 'STRING' },
          weeks: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                weekNumber: { type: 'NUMBER' },
                title: { type: 'STRING' },
                days: {
                  type: 'ARRAY',
                  items: {
                    type: 'OBJECT',
                    properties: {
                      dayNumber: { type: 'NUMBER' }, // 1-7
                      dayName: { type: 'STRING' },   // Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday
                      type: { type: 'STRING' },      // Learning | Revision | Exam
                      title: { type: 'STRING' },     // Added for frontend rendering
                      topicsList: { type: 'ARRAY', items: { type: 'STRING' }, nullable: true },
                      examQuestions: {
                        type: 'ARRAY',
                        items: {
                          type: 'OBJECT',
                          properties: {
                            question: { type: 'STRING' },
                            options: { type: 'ARRAY', items: { type: 'STRING' } },
                            correctIndex: { type: 'NUMBER' }, // 0-3
                            topicTag: { type: 'STRING' }
                          }
                        },
                        nullable: true
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

const LESSON_SCHEMA = {
  type: 'OBJECT',
  properties: {
    parts: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          partNumber: { type: 'NUMBER' },
          partTitle: { type: 'STRING' },
          cards: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                cardNumber: { type: 'NUMBER' },
                content: { type: 'STRING' }
              }
            }
          },
          miniExercise: {
            type: 'OBJECT',
            properties: {
              question: { type: 'STRING' },
              options: { type: 'ARRAY', items: { type: 'STRING' } },
              correctIndex: { type: 'NUMBER' },
              explanation: { type: 'STRING' }
            }
          }
        }
      }
    },
    task: {
      type: 'OBJECT',
      properties: {
        type: { type: 'STRING' }, // text | mcq
        description: { type: 'STRING' },
        questions: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              question: { type: 'STRING' },
              options: { type: 'ARRAY', items: { type: 'STRING' } },
              correctIndex: { type: 'NUMBER' },
              topicTag: { type: 'STRING' }
            }
          },
          nullable: true
        }
      },
      nullable: true
    }
  },
  required: ['parts']
};

// --- Verbatim System Instructions (Section 4) ---

const ROADMAP_SYSTEM_INSTRUCTION = `You are an expert curriculum designer and skill development mentor.
You design learning roadmaps for ANY skill or field — programming, cooking,
trading, music, language learning, or anything else a human might want to master.
You analyze the learner's profile deeply before designing the structure.
You always respond with ONLY valid JSON. No markdown, no explanation, no code fences.
You follow the exact JSON structure specified in every prompt precisely.
You never assume a skill is easy or short — if the goal requires 12 modules, design 12.
If the goal requires 2 modules, design 2. Let the skill and goal determine the length.
You always create exactly 7 days per week. Day 6 (Saturday) is always Revision.
Day 7 (Sunday) is always Exam. Days 1-5 are Learning.
Each exam day always has exactly 5 MCQ questions with a topicTag per question.`;

const LESSON_SYSTEM_INSTRUCTION = `You are a master educator who designs engaging, practical learning sessions
for any skill or field. You teach through clear explanation, relevant examples,
and active learning exercises. You write for the specific learner profile provided.
You always respond with ONLY valid JSON. No markdown. No explanation. No code fences.
Your lesson content must be specific, practical, and directly relevant to the topics listed.
Never use generic filler content. Every card must teach something real and concrete.

CRITICAL RULES FOR JSON:
1. partTitle must be a SHORT string, maximum 10 words. Example: "Variables and Data Types Review".
2. DO NOT put lesson content inside partTitle.
3. Each card.content must be 100-200 words of lesson text.`;

const FEEDBACK_SYSTEM_INSTRUCTION = `Evaluate this learner's task submission based on the task description and topics provided.
Provide feedback in exactly 3 paragraphs:
1. What the learner demonstrated correctly
2. What is missing, unclear, or could be improved
3. One specific actionable next step

End with exactly one line: OUTCOME: positive OR OUTCOME: needs_improvement
Keep response under 200 words. Be encouraging and specific. Never be vague.`;

// --- Service Helpers ---

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parseResponse = (responseText) => {
  try {
    if (typeof responseText === 'object') return responseText;
    return JSON.parse(responseText);
  } catch (err) {
    console.error('Failed to parse Gemini response:', responseText);
    throw new Error('JSON_PARSE_FAILURE');
  }
};

const generateContent = async ({ model, prompt, systemInstruction, schema, isJson = true }) => {
  let attempts = 0;
  const maxRetries = 3;

  while (attempts < maxRetries) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: isJson ? 'application/json' : 'text/plain',
          responseSchema: schema,
          temperature: isJson ? 0.7 : 0.5,
          maxOutputTokens: isJson ? 8192 : 512,
        }
      });
      const text = response.text;
      if (!text) throw new Error('EMPTY_RESPONSE');
      let parsed = isJson ? parseResponse(text) : text;

      // Safety Pass: Truncate partTitle if it got corrupted into a massive string
      if (isJson && parsed.parts && Array.isArray(parsed.parts)) {
        parsed.parts = parsed.parts.map(part => ({
          ...part,
          partTitle: typeof part.partTitle === 'string' 
            ? (part.partTitle.length > 100 ? part.partTitle.substring(0, 100) + "..." : part.partTitle)
            : "Topic Overview"
        }));
      }

      return parsed;
    } catch (error) {
      attempts++;
      const is429 = error.message?.includes('429') || error.status === 429;
      const is500 = error.message?.includes('500') || error.status === 500;
      const shouldRetry = (is429 || is500) && attempts < maxRetries;

      console.error(`Gemini (${model}) Attempt ${attempts} failed: ${error.message}${shouldRetry ? '. Retrying...' : ''}`);

      if (shouldRetry) {
        // Exponential backoff: 5s, 15s, 30s
        const waitMs = attempts === 1 ? 5000 : attempts === 2 ? 15000 : 30000;
        console.log(`Waiting ${waitMs / 1000}s before retry...`);
        await wait(waitMs);
      } else {
        if (error.message === 'JSON_PARSE_FAILURE') throw error;
        throw new Error('GEMINI_FAILURE');
      }
    }
  }
};

// --- Exports (Verbatim Prompt Templates from Section 4) ---


export const generateRoadmapSkeleton = (data) => {
  const prompt = `Generate a complete learning roadmap skeleton for this learner:
\`\`\`json
Skill to learn: ${data.skillInput}
Learning goal: ${data.motivation}
Current level: ${data.currentLevel}
Role: ${data.role}
Learning style: ${data.learningStyle}
Goal clarity: ${data.goalClarity}
Daily time available: ${data.dailyTime}
\`\`\`
INSTRUCTIONS:
First decide the canonical skill name
Decide how many modules are genuinely needed to reach the learner's stated goal from their current level. Be realistic. Do not pad or compress.
Decide how many weeks each module needs. At least 1, no maximum.
Each week has exactly 7 days: Mon-Fri = Learning, Sat = Revision, Sun = Exam
For each Learning day: list 2-4 specific topics to cover that day
For Revision day: topicsList is empty array (populated dynamically later)
For Exam day: write exactly 5 MCQ questions testing that week's topics
Each question needs: question string, 4 options, correctIndex (0-3), topicTag`;

  return generateContent({
    // gemini-3-flash-preview
    model: 'gemini-2.5-flash',
    prompt,
    systemInstruction: ROADMAP_SYSTEM_INSTRUCTION,
    schema: ROADMAP_SCHEMA
  });
};


export const generateLessonContent = (data) => {
  let prompt = "";
  
  if (data.isExamRetry) {
    prompt = `Generate a targeted re-learning session for this learner who failed an exam:
Skill: ${data.skillName}
Failed exam topics (from wrong answers): ${data.weakTopics}
Learner's exam answers: ${data.examAnswerSummary}
Previous attempt number: ${data.attemptNumber}
Create a focused lesson targeting ONLY the failed topics.
Be direct. Re-explain from scratch using completely different examples.
Do not assume the learner remembers anything about these topics.
Use 2 parts maximum. Include mini-exercises.
No task — learner will take the regenerated exam immediately after.`;
  } else if (data.isRevision) {
    prompt = `Generate a revision session for this learner:
Skill: ${data.skillName}
Week being revised: Module ${data.moduleNumber}, Week ${data.weekNumber}
Topics the learner struggled with this week: ${data.weakTopicsStr}
If weak topics list is empty, revise all topics covered this week: ${data.allWeekTopics}
Learner level: ${data.currentLevel}
Create a focused revision session with 1 part containing 3-4 cards that:
- Re-explain each weak topic from a different angle
- Give new examples the learner hasn't seen before
- Connect concepts together
- Include 1 mini-exercise per weak topic.
No task for revision sessions.`;
  } else {
    prompt = `Generate a complete learning session for this learner:
\`\`\`json
Skill: ${data.skillName}
Module: ${data.moduleNumber} — ${data.moduleTitle}
Week: ${data.weekNumber} — ${data.weekTitle}
Day: ${data.dayNumber} — ${data.dayName}
Topics to cover today: ${data.topicsList?.join(', ') || ''}
Learner level: ${data.currentLevel}
Learner goal: ${data.motivation}
Learning style: ${data.learningStyle}
Daily time available: ${data.dailyTime}
\`\`\`
Create a lesson with exactly 3 parts. Each part covers a subset of today's topics.
Each part has 2-4 cards of content (each card = 100-200 words, clear and specific).
Each part ends with 1 mini-exercise (single MCQ to check understanding of that part).
After the 3 parts, create 1 task for the learner to apply what they learned.
Task type decision:
If today's topics are theoretical/conceptual: type = "mcq", 10-15 questions
If today's topics are practical/hands-on/creative: type = "text", one open question`;
  }

  return generateContent({
    model: 'gemini-2.5-flash',
    prompt,
    systemInstruction: LESSON_SYSTEM_INSTRUCTION,
    schema: LESSON_SCHEMA
  });
};

export const generateFeedback = (data) => {
  const prompt = `Evaluate this learner's task submission:
Task description: ${data.description}
Topics this task covers: ${data.topicsList}
Learner's answer: ${data.userAnswer}
Provide feedback in exactly 3 paragraphs:
1. What the learner demonstrated correctly
2. What is missing, unclear, or could be improved
3. One specific actionable next step

End with exactly one line: OUTCOME: positive OR OUTCOME: needs_improvement
Keep response under 200 words. Be encouraging and specific. Never be vague.`;

  return generateContent({
    model: 'gemini-2.5-flash',
    prompt,
    systemInstruction: FEEDBACK_SYSTEM_INSTRUCTION,
    isJson: false
  });
};
*/
// ===============================
/*
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ─── THE ONE FIX THAT SOLVES EVERYTHING ───────────────────────────────────────
// gemini-3-flash-preview does NOT exist. It was silently failing before Gemini
// was even contacted, which is why the API call counter never incremented.
// Use gemini-1.5-flash for ALL calls — it's fast, cheap, and actually exists.
const MODEL = 'gemini-2.5-flash';
// ──────────────────────────────────────────────────────────────────────────────

// --- JSON Schemas ---

const ROADMAP_SCHEMA = {
  type: 'OBJECT',
  properties: {
    skillName: { type: 'STRING' },
    targetLevel: { type: 'STRING' },
    totalModules: { type: 'NUMBER' },
    estimatedWeeks: { type: 'NUMBER' },
    modules: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          moduleNumber: { type: 'NUMBER' },
          title: { type: 'STRING' },
          weeks: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                weekNumber: { type: 'NUMBER' },
                title: { type: 'STRING' },
                days: {
                  type: 'ARRAY',
                  items: {
                    type: 'OBJECT',
                    properties: {
                      dayNumber: { type: 'NUMBER' },
                      dayName: { type: 'STRING' },
                      type: { type: 'STRING' },
                      title: { type: 'STRING' },
                      topicsList: { type: 'ARRAY', items: { type: 'STRING' }, nullable: true },
                      examQuestions: {
                        type: 'ARRAY',
                        items: {
                          type: 'OBJECT',
                          properties: {
                            question: { type: 'STRING' },
                            options: { type: 'ARRAY', items: { type: 'STRING' } },
                            correctIndex: { type: 'NUMBER' },
                            topicTag: { type: 'STRING' }
                          }
                        },
                        nullable: true
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

const LESSON_SCHEMA = {
  type: 'OBJECT',
  properties: {
    parts: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          partNumber: { type: 'NUMBER' },
          partTitle: { type: 'STRING' },
          cards: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                cardNumber: { type: 'NUMBER' },
                content: { type: 'STRING' }
              }
            }
          },
          miniExercise: {
            type: 'OBJECT',
            properties: {
              question: { type: 'STRING' },
              options: { type: 'ARRAY', items: { type: 'STRING' } },
              correctIndex: { type: 'NUMBER' },
              explanation: { type: 'STRING' }
            }
          }
        }
      }
    },
    task: {
      type: 'OBJECT',
      properties: {
        type: { type: 'STRING' },
        description: { type: 'STRING' },
        questions: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              question: { type: 'STRING' },
              options: { type: 'ARRAY', items: { type: 'STRING' } },
              correctIndex: { type: 'NUMBER' },
              topicTag: { type: 'STRING' }
            }
          },
          nullable: true
        }
      },
      nullable: true
    }
  },
  required: ['parts']
};

// --- System Instructions ---

const ROADMAP_SYSTEM_INSTRUCTION = `You are an expert curriculum designer and skill development mentor.
You design learning roadmaps for ANY skill or field — programming, cooking,
trading, music, language learning, or anything else a human might want to master.
You analyze the learner's profile deeply before designing the structure.
You always respond with ONLY valid JSON. No markdown, no explanation, no code fences.
You follow the exact JSON structure specified in every prompt precisely.
You never assume a skill is easy or short — if the goal requires 12 modules, design 12.
If the goal requires 2 modules, design 2. Let the skill and goal determine the length.
You always create exactly 7 days per week. Day 6 (Saturday) is always Revision.
Day 7 (Sunday) is always Exam. Days 1-5 are Learning.
Each exam day always has exactly 5 MCQ questions with a topicTag per question.`;

const LESSON_SYSTEM_INSTRUCTION = `You are a master educator who designs engaging, practical learning sessions
for any skill or field. You teach through clear explanation, relevant examples,
and active learning exercises. You write for the specific learner profile provided.
You always respond with ONLY valid JSON. No markdown. No explanation. No code fences.
Your lesson content must be specific, practical, and directly relevant to the topics listed.
Never use generic filler content. Every card must teach something real and concrete.

CRITICAL RULES FOR JSON:
1. partTitle must be a SHORT string, maximum 10 words. Example: "Variables and Data Types Review".
2. DO NOT put lesson content inside partTitle.
3. Each card.content must be 100-200 words of lesson text.`;

const FEEDBACK_SYSTEM_INSTRUCTION = `Evaluate this learner's task submission based on the task description and topics provided.
Provide feedback in exactly 3 paragraphs:
1. What the learner demonstrated correctly
2. What is missing, unclear, or could be improved
3. One specific actionable next step

End with exactly one line: OUTCOME: positive OR OUTCOME: needs_improvement
Keep response under 200 words. Be encouraging and specific. Never be vague.`;

// --- Core Helper ---

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parseResponse = (responseText) => {
  try {
    if (typeof responseText === 'object') return responseText;
    return JSON.parse(responseText);
  } catch (err) {
    console.log(responseText);
    console.error('Failed to parse Gemini response:', responseText?.substring(0, 300));
    throw new Error('JSON_PARSE_FAILURE');
  }
};

const generateContent = async ({ prompt, systemInstruction, schema, isJson = true }) => {
  let attempts = 0;
  const maxRetries = 3;

  while (attempts < maxRetries) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL, // always gemini-1.5-flash
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: isJson ? 'application/json' : 'text/plain',
          responseSchema: schema,
          temperature: isJson ? 0.7 : 0.5,
          maxOutputTokens: isJson ? 8192 : 512,
        }
      });

      const text = response.text;
      if (!text) throw new Error('EMPTY_RESPONSE');

      let parsed = isJson ? parseResponse(text) : text;

      // Safety: truncate corrupted partTitle
      if (isJson && parsed.parts && Array.isArray(parsed.parts)) {
        parsed.parts = parsed.parts.map(part => ({
          ...part,
          partTitle: typeof part.partTitle === 'string' && part.partTitle.length > 100
            ? part.partTitle.substring(0, 100)
            : (part.partTitle || 'Topic Overview')
        }));
      }

      return parsed;

    } catch (error) {
      attempts++;
      const is429 = error.message?.includes('429') || error.status === 429;
      const is500 = error.message?.includes('500') || error.status === 500;
      const shouldRetry = (is429 || is500) && attempts < maxRetries;

      console.error(`Gemini attempt ${attempts} failed: ${error.message}${shouldRetry ? ' — retrying...' : ''}`);

      if (shouldRetry) {
        const waitMs = attempts === 1 ? 5000 : attempts === 2 ? 15000 : 30000;
        console.log(`Waiting ${waitMs / 1000}s before retry...`);
        await wait(waitMs);
      } else {
        if (error.message === 'JSON_PARSE_FAILURE') throw error;
        throw new Error('GEMINI_FAILURE');
      }
    }
  }
};

// --- Exports ---

export const generateRoadmapSkeleton = (data) => {
  const prompt = `Generate a complete learning roadmap skeleton for this learner:
Skill to learn: ${data.skillInput}
Learning goal: ${data.motivation}
Current level: ${data.currentLevel}
Role: ${data.role}
Learning style: ${data.learningStyle}
Goal clarity: ${data.goalClarity}
Daily time available: ${data.dailyTime}

INSTRUCTIONS:
First decide the canonical skill name.
Decide how many modules are genuinely needed. Be realistic.
Each module has at least 1 week.
Each week has exactly 7 days: Mon-Fri = Learning, Sat = Revision, Sun = Exam.
For each Learning day: list 2-4 specific topics and a short day title.
For Revision day: topicsList is empty array, title is "Weekly Review".
For Exam day: write exactly 5 MCQ questions testing that week's topics.`;

  return generateContent({
    prompt,
    systemInstruction: ROADMAP_SYSTEM_INSTRUCTION,
    schema: ROADMAP_SCHEMA
  });
};

export const generateLessonContent = (data) => {
  let prompt = '';

  if (data.isExamRetry) {
    prompt = `Generate a targeted re-learning session for this learner who failed an exam:
Skill: ${data.skillName}
Failed exam topics: ${data.weakTopics}
Previous attempt number: ${data.attemptNumber}
Create a focused lesson targeting ONLY the failed topics.
Re-explain from scratch using completely different examples.
Use 2 parts maximum. Include mini-exercises. No task.`;
  } else if (data.isRevision) {
    prompt = `Generate a revision session for this learner:
Skill: ${data.skillName}
Week being revised: Module ${data.moduleNumber}, Week ${data.weekNumber}
Topics the learner struggled with: ${data.weakTopicsStr || 'General review'}
If no weak topics, revise: ${data.allWeekTopics || 'all topics covered this week'}
Create a focused revision session with 1 part containing 3-4 cards.
Re-explain each weak topic from a different angle with new examples.
No task for revision sessions.`;
  } else {
    prompt = `Generate a complete learning session for this learner:
Skill: ${data.skillName}
Module: ${data.moduleNumber} — ${data.moduleTitle}
Week: ${data.weekNumber} — ${data.weekTitle}
Day: ${data.dayNumber} — ${data.dayName}
Topics to cover today: ${data.topicsList?.join(', ') || ''}
Learner level: ${data.currentLevel}
Learner goal: ${data.motivation}
Learning style: ${data.learningStyle}
Daily time available: ${data.dailyTime}

Create a lesson with exactly 3 parts. Each part covers a subset of today's topics.
Each part has 2-4 cards of content (each card = 100-200 words, clear and specific).
Each part ends with 1 mini-exercise (single MCQ to check understanding of that part).
After the 3 parts, create 1 task:
- If topics are theoretical/conceptual: type = "mcq", 10-15 questions
- If topics are practical/hands-on: type = "text", one open question`;
  }

  return generateContent({
    prompt,
    systemInstruction: LESSON_SYSTEM_INSTRUCTION,
    schema: LESSON_SCHEMA
  });
};

export const generateFeedback = (data) => {
  const prompt = `Evaluate this learner's task submission:
Task description: ${data.description}
Topics this task covers: ${data.topicsList}
Learner's answer: ${data.userAnswer}`;

  return generateContent({
    prompt,
    systemInstruction: FEEDBACK_SYSTEM_INSTRUCTION,
    isJson: false,
    schema: undefined
  });
};
*/


// ==============================================================================
// HARDENED GEMINI SERVICE — IMPLEMENTING SDK BEST PRACTICES
// ==============================================================================

import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODEL = 'gemini-2.5-flash';

// --- JSON Schemas (Fixed to use Type enum and remove nullable) ---

const ROADMAP_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    skillName: { type: Type.STRING },
    targetLevel: { type: Type.STRING },
    totalModules: { type: Type.NUMBER },
    estimatedWeeks: { type: Type.NUMBER },
    modules: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          moduleNumber: { type: Type.NUMBER },
          title: { type: Type.STRING },
          weeks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                weekNumber: { type: Type.NUMBER },
                title: { type: Type.STRING },
                days: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      dayNumber: { type: Type.NUMBER },
                      dayName: { type: Type.STRING },
                      type: { type: Type.STRING },
                      title: { type: Type.STRING },
                      topicsList: { type: Type.ARRAY, items: { type: Type.STRING } },
                      examQuestions: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            question: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            correctIndex: { type: Type.NUMBER },
                            topicTag: { type: Type.STRING }
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

const LESSON_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    parts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          partNumber: { type: Type.NUMBER },
          partTitle: { type: Type.STRING },
          cards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                cardNumber: { type: Type.NUMBER },
                content: { type: Type.STRING }
              }
            }
          },
          miniExercise: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctIndex: { type: Type.NUMBER },
              explanation: { type: Type.STRING }
            }
          }
        }
      }
    },
    task: {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING },
        description: { type: Type.STRING },
        questions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctIndex: { type: Type.NUMBER },
              topicTag: { type: Type.STRING }
            }
          }
        }
      }
    }
  },
  required: ['parts']
};

// --- System Instructions ---
const ROADMAP_SYSTEM_INSTRUCTION = `You are an expert curriculum designer and skill development mentor.
You design learning roadmaps for ANY skill or field — programming, cooking,
trading, music, language learning, or anything else a human might want to master.
You analyze the learner's profile deeply before designing the structure.
You always respond with ONLY valid JSON. No markdown, no explanation, no code fences.
You follow the exact JSON structure specified in every prompt precisely.
You never assume a skill is easy or short — if the goal requires 12 modules, design 12.
If the goal requires 2 modules, design 2. Let the skill and goal determine the length.
You always create exactly 7 days per week. Day 6 (Saturday) is always Revision.
Day 7 (Sunday) is always Exam. Days 1-5 are Learning.
Each exam day always has exactly 5 MCQ questions with a topicTag per question.

CRITICAL: Do not fragment your array responses. Ensure every object in the 'weeks' array contains weekNumber, title, and days IN ONE OBJECT.`;

const LESSON_SYSTEM_INSTRUCTION = `You are a master educator who designs engaging, practical learning sessions
for any skill or field. You teach through clear explanation, relevant examples,
and active learning exercises. You write for the specific learner profile provided.
You always respond with ONLY valid JSON. No markdown. No explanation. No code fences.
Your lesson content must be specific, practical, and directly relevant to the topics listed.
Never use generic filler content. Every card must teach something real and concrete.

CRITICAL RULES FOR JSON:
1. partTitle must be a SHORT string, maximum 10 words. Example: "Variables and Data Types Review".
2. DO NOT put lesson content inside partTitle.
3. Each card.content must be 100-200 words of lesson text.

ABSOLUTE CONSTRAINT FOR REVISION SESSIONS:
When the prompt asks for a revision session, the parts array must contain
EXACTLY ONE part object. Not two, not seven. ONE. That single part object
must contain: partNumber (1), partTitle (short string), cards (array of
exactly 3 card objects each with cardNumber and content of 120+ words),
and miniExercise (with question, 4 options, correctIndex integer 0-3,
explanation). Never return empty cards arrays. Never return a part without
cards. If you cannot generate cards, still generate 3 placeholder cards
with real content.
`;

const FEEDBACK_SYSTEM_INSTRUCTION = `Evaluate this learner's task submission based on the task description and topics provided.
Provide feedback in exactly 3 paragraphs:
1. What the learner demonstrated correctly
2. What is missing, unclear, or could be improved
3. One specific actionable next step

End with exactly one line: OUTCOME: positive OR OUTCOME: needs_improvement
Keep response under 200 words. Be encouraging and specific. Never be vague.`;

// --- Core Helper ---

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parseResponse = (responseText) => {
  try {
    if (typeof responseText === 'object') return responseText;
    return JSON.parse(responseText);
  } catch (err) {
    console.error('Failed to parse Gemini response:', responseText?.substring(0, 300));
    throw new Error('JSON_PARSE_FAILURE');
  }
};

/**
 * Validates that a parsed lesson object has the correct semantic structure.
 * Throws JSON_PARSE_FAILURE if structure is invalid — triggering retry logic.
 * Called after JSON.parse succeeds, before returning to caller.
 */
const validateLessonStructure = (parsed) => {
  // Must have parts array that is non-empty
  if (!parsed.parts || !Array.isArray(parsed.parts) || parsed.parts.length === 0) {
    console.error('[Gemini Validation] FAIL: parts array missing or empty');
    throw new Error('JSON_PARSE_FAILURE');
  }

  for (const part of parsed.parts) {
    // Each part must have a non-empty cards array
    if (!part.cards || !Array.isArray(part.cards) || part.cards.length === 0) {
      console.error(`[Gemini Validation] FAIL: part ${part.partNumber} has no cards`);
      throw new Error('JSON_PARSE_FAILURE');
    }

    // Each card must have meaningful content (minimum 50 chars)
    for (const card of part.cards) {
      if (
        !card.content ||
        typeof card.content !== 'string' ||
        card.content.trim().length < 50
      ) {
        console.error(`[Gemini Validation] FAIL: card ${card.cardNumber} in part ${part.partNumber} has no content`);
        throw new Error('JSON_PARSE_FAILURE');
      }
    }
  }

  // Validation passed
  return true;
};

/**
 * Cleans and validates a partTitle string.
 * Detects Gemini's repetitive hallucination pattern and replaces with fallback.
 * Strips trailing JSON artifacts like `, "` that appear when Gemini splits objects.
 */
const validatePartTitle = (title) => {
  if (typeof title !== 'string' || title.trim().length === 0) {
    return 'Topic Overview';
  }

  // Detect repetitive hallucination: e.g. "Revieweristive Foundationsistive Revieweristive..."
  // Pattern: if any word appears 3+ times in first 60 chars, it is hallucinated
  const sample = title.substring(0, 80).toLowerCase();
  const words = sample.split(/\s+/).filter(w => w.length > 3);
  const wordCounts = {};
  for (const word of words) {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
    if (wordCounts[word] >= 3) {
      console.warn('[Gemini Validation] Hallucinated partTitle detected, replacing with fallback');
      return 'Topic Overview';
    }
  }

  // Strip trailing JSON artifacts: `, "` or `",` or trailing whitespace
  const cleaned = title
    .replace(/[,"\s]+$/, '')  // trailing comma, quote, space
    .replace(/^[,"\s]+/, '')  // leading artifacts
    .trim();

  // Hard length cap
  return cleaned.substring(0, 80);
};

const generateContent = async ({ prompt, systemInstruction, schema, isJson = true }) => {
  let attempts = 0;
  const maxRetries = 3;

  while (attempts < maxRetries) {
    try {
      const config = {
        systemInstruction,
        responseMimeType: isJson ? 'application/json' : 'text/plain',
        temperature: isJson ? 0.8: 0.5,
        maxOutputTokens: isJson ? 65536 : 512,
        
      };

      // Ensure we don't pass `responseSchema: undefined` to the SDK validation
      if (isJson && schema) {
        config.responseSchema = schema;
      }

      const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config
      });

      const text = response.text;
      if (!text) throw new Error('EMPTY_RESPONSE');

      let parsed = isJson ? parseResponse(text) : text;

      // Safety: truncate corrupted partTitle
      // Structural validation + title cleaning for lesson responses
      if (isJson && parsed.parts !== undefined) {
        // 1. Validate semantic structure — throws JSON_PARSE_FAILURE on bad shape
        validateLessonStructure(parsed);

        // 2. Clean all partTitles
        parsed.parts = parsed.parts.map(part => ({
          ...part,
          partTitle: validatePartTitle(part.partTitle)
        }));
      }

      return parsed;

    }
    catch (error) {
      attempts++;
      const is429 = error.message?.includes('429') || error.status === 429;
      const is500 = error.message?.includes('500') || error.status === 500;
      const shouldRetry = (is429 || is500) && attempts < maxRetries;

      // Better error logging
      console.error(`Gemini attempt ${attempts} failed: ${error.message}${shouldRetry ? ' — retrying...' : ''}`);

      if (shouldRetry) {
        const waitMs = attempts === 1 ? 5000 : attempts === 2 ? 15000 : 30000;
        console.log(`Waiting ${waitMs / 1000}s before retry...`);
        await wait(waitMs);
      } else {
        if (error.message === 'JSON_PARSE_FAILURE') throw error;
        throw new Error(`GEMINI_FAILURE: ${error.message}`);
      }
    }
  }
};

// --- Exports ---

export const generateRoadmapSkeleton = (data) => {
  const prompt = `Generate a complete learning roadmap skeleton for this learner:
Skill to learn: ${data.skillInput}
Learning goal: ${data.motivation}
Current level: ${data.currentLevel}
Role: ${data.role}
Learning style: ${data.learningStyle}
Goal clarity: ${data.goalClarity}
Daily time available: ${data.dailyTime}

INSTRUCTIONS:
First decide the canonical skill name.
Decide how many modules are genuinely needed. Be realistic.
Each module has at least 1 week.
Each week has exactly 7 days: Mon-Fri = Learning, Sat = Revision, Sun = Exam.
For each Learning day: list 2-4 specific topics and a short day title.
For Revision day: topicsList is empty array, title is "Weekly Review".
For Exam day: write exactly 5 MCQ questions testing that week's topics.`;

  return generateContent({
    prompt,
    systemInstruction: ROADMAP_SYSTEM_INSTRUCTION,
    schema: ROADMAP_SCHEMA
  });
};

export const generateLessonContent = (data) => {
  let prompt = '';

  if (data.isExamRetry) {
    prompt = `Generate a focused revision lesson for a learner who needs to review weak topics.

LEARNER CONTEXT:
Skill: ${data.skillName}
Topics the learner struggled with: ${data.weakTopicsStr || 'General review of the week'}
All topics from this week (fallback if no weak topics): ${data.allWeekTopics || 'Week topics'}
Learner level: ${data.currentLevel || 'Beginner'}

OUTPUT REQUIREMENTS (these are non-negotiable):
- The parts array must contain EXACTLY 1 part object
- That part must have partNumber: 1
- That part must have partTitle: a short descriptive string like "Week Revision: Core Concepts"
- That part must have cards: an array of EXACTLY 3 card objects
  - card 1: cardNumber: 1, content: 120-200 words re-explaining the first weak topic from a new angle
  - card 2: cardNumber: 2, content: 120-200 words re-explaining the second weak topic (or connecting concepts)
  - card 3: cardNumber: 3, content: 120-200 words showing practical application with a new example
- That part must have miniExercise: an object with question, options (4 strings), correctIndex (0-3), explanation
- task must be null — revision sessions have no task

Do not add more than 1 part. Do not return empty cards arrays.`;
  } else if (data.isRevision) {
    prompt = `Generate a revision session for this learner:
Skill: ${data.skillName}
Week being revised: Module ${data.moduleNumber}, Week ${data.weekNumber}
Topics the learner struggled with: ${data.weakTopicsStr || 'General review'}
If no weak topics, revise: ${data.allWeekTopics || 'all topics covered this week'}
Create a focused revision session with 1 part containing 3-4 cards.
Re-explain each weak topic from a different angle with new examples.
No task for revision sessions.`;
  } else {
    prompt = `Generate a complete learning session for this learner:
Skill: ${data.skillName}
Module: ${data.moduleNumber} — ${data.moduleTitle}
Week: ${data.weekNumber} — ${data.weekTitle}
Day: ${data.dayNumber} — ${data.dayName}
Topics to cover today: ${data.topicsList?.join(', ') || ''}
Learner level: ${data.currentLevel}
Learner goal: ${data.motivation}
Learning style: ${data.learningStyle}
Daily time available: ${data.dailyTime}

Create a lesson with exactly 3 parts. Each part covers a subset of today's topics.
Each part has 2-4 cards of content (each card = 100-200 words, clear and specific).
Each part ends with 1 mini-exercise (single MCQ to check understanding of that part).
After the 3 parts, create 1 task:
- If topics are theoretical/conceptual: type = "mcq", 10-15 questions
- If topics are practical/hands-on: type = "text", one open question`;
  }

  return generateContent({
    prompt,
    systemInstruction: LESSON_SYSTEM_INSTRUCTION,
    schema: LESSON_SCHEMA
  });
};

export const generateFeedback = (data) => {
  const prompt = `Evaluate this learner's task submission:
Task description: ${data.description}
Topics this task covers: ${data.topicsList}
Learner's answer: ${data.userAnswer}`;

  return generateContent({
    prompt,
    systemInstruction: FEEDBACK_SYSTEM_INSTRUCTION,
    isJson: false,
  });
};