# SessionPage

## Purpose
Implements a multi-phase learning session orchestrator that guides users through structured lessons, practice tasks, and exams, with AI-powered feedback and progress tracking at each stage.

## Responsibility Boundary
**Responsible for:**
- Managing the phase state machine (LOADING → LESSON/EXAM → TASK → FEEDBACK/RESULT → complete)
- Fetching session data from the server (lesson content, questions, etc.)
- Coordinating all phase components and phase transitions
- Rendering the currently active phase UI
- Handling errors during session load and phase submission
- Displaying session metadata (title, type, current phase)

**NOT responsible for:**
- Rendering individual lesson cards (that's LessonPhase/PartCard)
- Validating user answers (that's the backend)
- Managing global progress state (that's AppContext)
- UI styling beyond phase coordination (that's individual phases)

## Contents

| File | Type | Purpose |
|------|------|---------|
| **SessionPage.jsx** | Page Container | Main orchestrator, manages PHASES constant, state, and phase transitions |
| **ExamResult.jsx** | Result Component | Displays pass/fail outcome of weekly exam with weak topics list |
| **phases/LessonPhase.jsx** | Phase Component | Orchestrates lesson parts, cards, progress, and mini exercises |
| **phases/TaskPhase.jsx** | Phase Component | Handles text-based and MCQ task submissions with AI feedback |
| **phases/ExamPhase.jsx** | Phase Component | Delivers multiple-choice exam questions with progress tracking |
| **phases/FeedbackPhase.jsx** | Phase Component | Displays AI-generated feedback and resources after task submission |
| **phases/MiniExercise.jsx** | Sub-component | Quick MCQ exercise shown after each lesson part with instant feedback |
| **phases/PartCard.jsx** | Sub-component | Renders individual lesson card (slide) with markdown content |

## How It Works

### SessionPage: Phase State Machine

SessionPage is a **finite state machine** with 7 states. Only one phase is active at any time.

```
LOADING
  ↓ (session loaded)
LESSON  →  TASK  →  FEEDBACK  →  navigate /learn
  OR
EXAM  →  RESULT  →  navigate /learn
  ↓ (error)
ERROR  →  retry/navigate
```

**State flow:**

1. **LOADING**: Initial state. Fetching session via `getSession(dayId, roadmapId)`
   - Show spinner, "Preparing your session..."
   - If session takes >15s (AI generation), show patience message

2. **LESSON** OR **EXAM**: Determined by `session.type`
   - If type is "Exam" → jump to EXAM phase
   - Else → start at LESSON phase

3. **LESSON**: Lesson delivery through parts and cards
   - User progresses through parts → cards → mini exercise
   - All parts completed → transition to TASK

4. **TASK**: Applied practice (text or MCQ)
   - User submits answer → backend evaluates
   - Success → move to FEEDBACK

5. **FEEDBACK**: AI guidance on task performance
   - User clicks "Continue" → calls `advanceProgress()`
   - Navigate to /learn (session marked complete)

6. **EXAM**: Weekly assessment
   - User answers all questions → transition to RESULT

7. **RESULT**: Exam outcome display
   - Pass: green badge, advance to next week
   - Fail: red badge, list weak topics, return to revision queue

8. **ERROR**: Session load failed
   - Show error message, offer "Try Again" or "Back to Dashboard"

### SessionPage Code Structure

```jsx
const PHASES = { LOADING, LESSON, TASK, FEEDBACK, EXAM, RESULT, ERROR };

export default function SessionPage() {
  const { dayId } = useParams();
  const { roadmapId } = useApp();
  
  // Phase state
  const [phase, setPhase] = useState(PHASES.LOADING);
  const [session, setSession] = useState(null);
  const [feedbackData, setFeedbackData] = useState(null);
  const [examResult, setExamResult] = useState(null);
  const [error, setError] = useState(null);
  
  // On mount: fetch session
  useEffect(() => { getSession(...) }, [dayId, roadmapId]);
  
  // Transition handlers
  const handleLessonComplete = () => setPhase(PHASES.TASK);
  const handleTaskComplete = (payload) => { setFeedbackData(payload); setPhase(PHASES.FEEDBACK); };
  const handleExamComplete = (payload) => { setExamResult(payload); setPhase(PHASES.RESULT); };
  
  // Render: show only current phase
  if (phase === PHASES.LOADING) return <LoadingUI />;
  if (phase === PHASES.ERROR) return <ErrorUI />;
  if (phase === PHASES.LESSON) return <LessonPhase ... />;
  // ... etc
}
```

### LessonPhase: Part → Card → Mini Exercise Progression

**Data structure:**
```javascript
parts = [
  {
    partNumber: 1,
    partTitle: "Basics",
    cards: [
      { cardNumber: 1, content: "# Intro to X\n\n..." },
      { cardNumber: 2, content: "## Key Concept\n\n..." }
    ],
    miniExercise: { question: "Q?", options: [], correctIndex: 1, explanation: "..." }
  },
  // ... more parts
]
```

**User flow within a lesson:**
```
1. User sees Part 1, Card 1
2. Reads content (markdown rendered)
3. Clicks "Next Card" → Part 1, Card 2
4. Clicks "Next Card" (last card) → Shows MiniExercise for Part 1
5. Selects answer, clicks "Check Answer" → Shows feedback (✓ correct or ✗ wrong)
6. Clicks "Next Part" → Part 2, Card 1
7. Repeats for all parts
8. After last part's mini exercise → clicks "Finish Lesson" → calls onComplete()
9. LessonPhase done, transition to TASK
```

**Key state in LessonPhase:**
- `partIndex`: current part (0-indexed)
- `cardIndex`: current card within part
- `showMini`: boolean, whether to show mini exercise
- `miniDone`: boolean, mini has been answered
- `overallProgress`: % of all cards completed

**Progress calculation:**
```javascript
totalCards = sum of all part.cards.length
completedCards = parts[0..partIndex-1].cards.length + cardIndex
overallProgress = (completedCards / totalCards) * 100
```

### TaskPhase: Text or MCQ Submit

**Two task types:**

1. **Text task:**
   - User writes free-text answer
   - Min 20 characters enforced
   - Backend AI evaluates and returns feedback + outcome ("positive" or "needs_improvement")
   - Call: `submitTask(dayId, { type: 'text', taskAnswer, mcqAnswers: null })`

2. **MCQ task:**
   - User answers multiple-choice questions
   - All questions required before submit
   - Backend scores and returns feedback + score + passed boolean
   - Call: `submitTask(dayId, { type: 'mcq', taskAnswer: null, mcqAnswers: [] })`

**Special case:** No task (e.g., revision-only day)
- Show "Session Completed!" message
- User clicks "Finish Session" to proceed to feedback

**Error handling:** Inline error messages with retry option

### ExamPhase: Weekly Assessment

**Data structure:**
```javascript
questions = [
  {
    question: "What is X?",
    options: ["A", "B", "C", "D"],
    correctIndex: 2,
    topicTag: "Functions"
  },
  // ... more questions
]
```

**User flow:**
```
1. See Question 1 of N
2. Red progress bar shows (0/N answered)
3. Select an option → button enables "Next Question"
4. Click "Next Question" → Question 2
5. Repeat until last question
6. Last question shows "Submit Exam" button
7. Click "Submit" → all answers sent to backend
8. Backend grades, returns { score, passed, feedback, weakTopics }
9. ExamPhase done, transition to RESULT
```

**Key state:**
- `currentQ`: current question index
- `answers`: { [questionIndex]: selectedOptionIndex }
- `allAnswered`: boolean, all questions have selection
- Progress bar: red color (fail color theme)

### FeedbackPhase: Task Feedback & Resources

**Rendering:**
1. Outcome badge: green "Excellent Progress!" or yellow "Keep Working on It"
2. AI feedback text (markdown, multiple paragraphs)
3. Resources section (if provided): links to learning materials
4. "Continue to Next Day" button

**On continue click:**
- Call `advanceProgress(roadmapId, dayId, 'completed')`
- Call `refreshProgress()` to update global progress
- Navigate to /learn

**Handling non-fatal errors:** If advance fails, still navigate but show warning

### ExamResult: Pass/Fail Outcome

**Rendering:**
1. **Pass (green):**
   - Checkmark icon, "Passed" text, score %
   - Message: "Congratulations! You've mastered this week's content..."
   - Button: "Continue to Next Week" (green)
   - On click: advance progress, navigate

2. **Fail (red):**
   - X icon, "Needs Revision" text, score %
   - Message: "Review the topics below and take the exam again..."
   - Weak topics list (bullet points with fail color)
   - Button: "Back to Revision" (red)
   - On click: navigate to /learn (no progress advance)

### MiniExercise: Instant-Feedback MCQ

**Workflow:**
```
1. User sees question + 4 options
2. Selects option → radio button fills
3. Clicks "Check Answer" → submitted locally (not to server)
4. Show instant feedback:
   - Correct answer: green background, checkmark
   - Wrong answer: red background, X
   - Show explanation text
5. User clicks "Next Part" or "Finish Lesson" → parent handles navigation
```

**Key design:** Mini exercises are **not graded**; they're learning checkpoints with instant feedback. No API call to backend. This allows fast feedback loop within lesson.

### PartCard: Individual Lesson Card

**Simple leaf component:** Renders markdown content with previous/next navigation.

Props:
- `content`: markdown string to render
- `title`: part title label
- `isFirst`, `isLast`: control prev/next button visibility
- `hasExercise`, `isLastPart`: control final button label
- `onNext`, `onBack`, `onExercise`: navigation callbacks

Used within LessonPhase (but could be reused elsewhere).

## Key Design Decisions

### 1. **Phase state machine (vs. nested conditional rendering)**
**Decision:** SessionPage maintains a single `phase` state. Each phase renders completely independently. Only one phase is active at any time.

**Why:** Prevents bugs like multiple phases rendering, user navigating backwards unexpectedly, or phase state getting out of sync. Clear, linear flow. Easy to debug phase transitions.

**Alternative considered:** Each phase manages its own state and routing. Leads to implicit dependencies and race conditions.

### 2. **Mini exercises have instant local feedback (not graded)**
**Decision:** Mini exercises are MCQs shown after each lesson part, evaluated client-side with immediate visual feedback, not submitted to backend.

**Why:** Improves learning retention (test effect). Low-stakes, so user feels safe making mistakes. Fast feedback loop keeps user engaged. Reduces server load. Consistent UX pattern.

**Alternative considered:** Mini exercises graded by backend like tasks/exams. Adds latency; reduces learning efficacy.

### 3. **Text task minimum length (20 characters)**
**Decision:** Text submissions enforced to be ≥20 characters.

**Why:** Prevents single-word or meaningless answers ("yes", "ok"). Forces user to articulate thinking. Improves AI evaluation quality.

**Alternative considered:** No minimum. Too permissive.

### 4. **ExamPhase and TaskPhase submit different answer formats**
**Decision:** 
- ExamPhase: `{ roadmapId, answers: [{ questionIndex, selectedIndex }] }`
- TaskPhase: `{ roadmapId, type, taskAnswer, mcqAnswers }`

**Why:** Backend expects different schemas per endpoint. ExamPhase is graded, TaskPhase is evaluated via AI.

**Alternative considered:** Unified format. Would require backend changes and increase coupling.

### 5. **Exam result passed immediately triggers progress advance**
**Decision:** On exam pass, ExamResult immediately calls `advanceProgress()` and `refreshProgress()` before navigation. On fail, no progress advance (user stays in revision queue).

**Why:** Ensures progress is updated before user sees dashboard again. Fail case: user goes back to revision sessions.

**Alternative considered:** Always advance, let user manage revisions separately. Adds confusion about when to retry.

### 6. **Error state rendered full-screen**
**Decision:** If session fails to load, show full-screen error modal instead of partial UI.

**Why:** Session is foundational; can't proceed without it. Full-screen error is clear and blocks user from trying to interact with missing data.

**Alternative considered:** Render error inline. Could lead to confusion about what's broken.

### 7. **SessionPage owns phase transitions, not child phases**
**Decision:** Child phases (LessonPhase, TaskPhase, etc.) call `onComplete(payload)` callbacks. SessionPage decides the next phase and sets state.

**Why:** Prevents circular dependencies. SessionPage is source of truth for phase order. Easy to change phase sequences without touching phase components.

**Alternative considered:** Phases manage their own routing. Leads to tight coupling.

## Data Flow

### Initial Load
```
/session/:dayId route
    ↓
useParams() extracts dayId
useApp() provides roadmapId
    ↓
useEffect: getSession(dayId, roadmapId)
    ↓
Response: {
  session: {
    type: "Lesson" | "Exam",
    title: "...",
    content: {
      parts: [...],           // for Lesson
      task: {...},            // for Lesson
      examQuestions: [...]    // for Exam
    }
  }
}
    ↓
setSession(data.session)
Determine phase: type === "Exam" ? EXAM : LESSON
```

### Lesson → Task → Feedback Flow
```
[LESSON PHASE]
User completes all parts + mini exercises
    ↓
LessonPhase calls onComplete()
    ↓
SessionPage.handleLessonComplete() → setPhase(TASK)
    ↓
[TASK PHASE]
User submits text or MCQ answer
    ↓
TaskPhase calls onComplete({ feedback, outcome, resources })
    ↓
SessionPage.handleTaskComplete()
    → setFeedbackData(payload)
    → setPhase(FEEDBACK)
    ↓
[FEEDBACK PHASE]
User clicks "Continue"
    ↓
FeedbackPhase calls advanceProgress() + refreshProgress()
    ↓
Navigate to /learn
    ↓
Session complete, progress updated in global AppContext
```

### Exam → Result Flow
```
[EXAM PHASE]
User answers all questions, clicks "Submit Exam"
    ↓
ExamPhase calls submitExam(dayId, { answers[] })
    ↓
Response: { score, passed, feedback, weakTopics }
    ↓
ExamPhase calls onComplete(resultPayload)
    ↓
SessionPage.handleExamComplete()
    → setExamResult(payload)
    → setPhase(RESULT)
    ↓
[RESULT PHASE]
ExamResult rendered with pass/fail UI
    ↓
User clicks "Continue to Next Week" (pass) or "Back to Revision" (fail)
    ↓
If pass: ExamResult calls advanceProgress() → navigate
If fail: just navigate (no progress advance)
    ↓
Navigate to /learn
```

## Dependencies

### Depends On:
- `react` — useState, useEffect, hooks
- `react-router-dom` — useParams, useNavigate
- `../context/AppContext` — roadmapId, refreshProgress()
- `../api/session.api` — getSession(), submitTask(), submitExam()
- `../api/progress.api` — advanceProgress()
- `../components/ui/*` — Button, Badge, LoadingSpinner
- `react-markdown` — Render markdown in lessons, feedback, exam questions

### Depended On By:
- Routing configuration — `/session/:dayId` route
- LearnPage — Link to day → navigate to /session/:dayId
- RoadmapPage — Day click → navigate to /session/:dayId

## Common Mistakes / Gotchas

1. **Forgetting to check `session` before accessing `session.content`**
   - ❌ Don't: `{phase === LESSON && <LessonPhase parts={session.content.parts} />}`  (crashes if session is null during load)
   - ✅ Do: `{phase === LESSON && session && <LessonPhase parts={session.content.parts} />}`

2. **Not clearing feedback/examResult when phase changes**
   - ❌ Issue: Old data from previous phase might flash briefly
   - ✅ Do: Clear state when transitioning to new phase, or ensure new phase checks data structure

3. **Calling onComplete() multiple times in a phase**
   - ❌ Don't: Accidentally call `onComplete()` in useEffect and in click handler
   - ✅ Do: Call onComplete() only in one place (event handler), not in useEffect

4. **Not handling async errors in phase transition**
   - ❌ Don't: `TaskPhase.onComplete()` calls without try/catch for network errors
   - ✅ Do: Wrap API calls in try/catch, set error state, show user feedback

5. **Mini exercises graded by backend (defeats the purpose)**
   - ❌ Issue: Adds latency, defeats instant feedback design
   - ✅ Design: Mini exercises are client-side only; formal task/exam go to backend

6. **Exam questions not fully answered before submit**
   - ❌ Issue: User clicks submit without answering all questions
   - ✅ Do: ExamPhase enforces `allAnswered` check, disables submit button if incomplete

7. **Progress advance failing silently**
   - ❌ Issue: User sees "Continue" success, but progress doesn't advance
   - ✅ Do: Log errors, set warning state, still navigate (non-fatal)

8. **Weak topic list not displaying on exam fail**
   - ❌ Issue: ExamResult receives empty weakTopics array
   - ✅ Do: Ensure backend returns weakTopics; ExamResult renders only if array is non-empty

9. **Not validating session.type before choosing phase**
   - ❌ Issue: Typo in backend → phase defaults to LESSON instead of EXAM
   - ✅ Do: Handle both cases explicitly; log if type is unexpected

10. **Markdown rendering differences between phases**
    - ❌ Issue: PartCard renders code blocks differently than ExamPhase
    - ✅ Do: Standardize prose classes across all components using react-markdown

## Extension Points

### Adding a New Phase

1. **Add phase constant:**
   ```javascript
   const PHASES = { ..., NEW: 'new' };
   ```

2. **Create phase component:** `phases/NewPhase.jsx`
   ```jsx
   export default function NewPhase({ phaseData, dayId, roadmapId, onComplete }) {
     // Render UI
     const handleSubmit = () => {
       onComplete({ /* payload for next phase */ });
     };
     return <div>...</div>;
   }
   ```

3. **Add transition handler in SessionPage:**
   ```javascript
   const handleNewPhaseComplete = (payload) => {
     setNewPhaseData(payload);
     setPhase(PHASES.NEXT);
   };
   ```

4. **Add phase render in SessionPage JSX:**
   ```jsx
   {phase === PHASES.NEW && (
     <NewPhase 
       data={...} 
       dayId={dayId} 
       roadmapId={roadmapId}
       onComplete={handleNewPhaseComplete}
     />
   )}
   ```

5. **Update phase order if needed:** Adjust which phases can transition to which

### Modifying Lesson Structure

- Change `parts` schema → update LessonPhase destructuring
- Add fields to `miniExercise` → update MiniExercise component
- Change card rendering → update PartCard props

### Changing Exam Behavior

- Randomize question order: `const [questions] = useState(() => shuffle(props.questions))`
- Add timer: `useEffect(() => { const timer = ... }, [])` in ExamPhase
- Show score during exam: Add running score display (optional, currently hidden until submit)

### Adding Resource Links Post-Feedback

FeedbackPhase already supports `resources` prop. Ensure backend populates this field. Component automatically parses markdown links `[title](url)` and plain URLs.

### Implementing Partial Session Saves (Checkpoint)

- Add `saveProgress()` API call at each phase completion
- Store `{ phase, cardIndex, partIndex, ... }` server-side
- On session reload, check for checkpoint and resume from that phase
- Useful for long lessons (>30 min)

