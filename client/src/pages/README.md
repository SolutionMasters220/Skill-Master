# Pages

## Purpose
Implements the primary user-facing views (screens) of the application, where each page corresponds to a major route in the learning platform and orchestrates its own data fetching, state management, and component composition.

## Responsibility Boundary
**Responsible for:**
- Rendering full-screen layouts for each primary route
- Fetching page-specific data from API services
- Managing page-level state (loading, errors, user navigation)
- Orchestrating sub-components to build the UI for that route
- Handling phase transitions (e.g., lesson → task → feedback in SessionPage)

**NOT responsible for:**
- Reusable UI components (those are in `/components`)
- API communication logic (that's in `/api`)
- Global state management (that's in `/context`)
- Shared business logic or helpers (those are in `/utils`)
- Routing configuration (that's in `/routes`)

## Contents

| Folder/File | Type | Purpose |
|-------------|------|---------|
| **AuthPage** | Page Container | Login/signup form with email validation, error handling, and mode switching |
| **LearnPage** | Page Container | Dashboard showing active learning session, stats, and revision queue |
| **NotFoundPage** | Page Container | 404 error page with conditional navigation based on auth state |
| **ProgressPage** | Page Container | Learning record, performance stats, and completion history |
| **RoadmapPage** | Page Container | Visual course structure with module/week/day breakdown and progress indicators |
| **SetupPage** | Page Container | Questionnaire to gather learner profile and generate personalized roadmap |
| **SessionPage** | Page Container | Multi-phase learning session orchestrator (lesson → task → feedback/exam → result) |
| **SessionPage/phases** | Sub-components | Phase-specific UI: LessonPhase, TaskPhase, ExamPhase, FeedbackPhase, MiniExercise, PartCard, ExamResult |

## How It Works

### Page Lifecycle (General Pattern)

```
1. User navigates to /route
   ↓
2. Page component mounts (useEffect runs)
   ↓
3. Page renders LOADING state
   ↓
4. API call executes (if needed)
   ↓
5. Response handled: success → render DATA state, error → render ERROR state
   ↓
6. User interacts with page (button clicks, form submissions)
   ↓
7. Event handler updates local state or triggers navigation
```

### AuthPage: Authentication Flow
**Trigger:** User visits `/auth` while unauthenticated

```
1. Display two-tab interface: Login | Signup
2. User enters email + password (+ name for signup)
3. Validation: email format, password length, password match (signup only)
4. Submit → calls useAuth().login() or useAuth().signup()
5. On success:
   - Token stored in localStorage
   - User state updated globally
   - Navigate to /learn (if roadmap exists) or /setup (first time)
6. On error: Display field-specific error messages or general error alert
```

**Key state:**
- `mode`: "login" | "signup"
- `formData`: { name, email, password, confirmPassword }
- `errors`: { fieldName: errorMessage }
- `isLoading`: submitted awaiting response

### LearnPage: Dashboard

**Trigger:** User visits `/learn` after authentication and roadmap setup

```
1. useApp() hook fetches active roadmap and progress
2. If roadmapLoading → show spinner
3. If !roadmapJson → show "no roadmap" state, offer /setup link
4. If roadmapJson + progress → extract current session info:
   - current module/week/day from progress
   - look up day in roadmapJson to get title, type, etc.
5. Render session card, stats, revision queue
6. On session card click → navigate to /session/:dayId
7. On stats card click → navigate to /progress
```

**Key decision:** Uses `getCurrentSession()` helper to map progress (module/week/day numbers) → roadmap structure, with fallback logic for week numbering inconsistencies.

### SetupPage: Roadmap Generation

**Trigger:** User visits `/setup` (first time) or from /learn (no roadmap)

```
1. Render questionnaire form:
   - Role (Student, Job Seeker, Other)
   - Skill input (free text)
   - Current level (Beginner, Intermediate, Advanced)
   - Learning style (Reading, Videos, Practice)
   - Goal clarity (Specific, General, Exploratory)
   - Daily time commitment
2. Validate all required fields
3. Submit → calls generateRoadmap(formData)
4. Backend processes: AI generates curriculum
5. Fetch fresh roadmap with getActiveRoadmap()
6. Update global AppContext with roadmapId, roadmapJson, progress
7. Navigate to /roadmap to display new curriculum
```

### RoadmapPage: Curriculum Visualization

**Trigger:** User visits `/roadmap` after setup or from dashboard

```
1. Display roadmap metadata: skill name, target level, total weeks, status
2. List all modules as horizontal cards (scrollable on mobile)
3. Module card shows:
   - Status badge: "In Progress" (current), "Completed" (lock icon), "Locked" (lock icon)
   - Title and week count
   - Active state with blue border/glow
4. On module click: select it, show weeks below
5. On week click: select it, show days for that week
6. Day shows status indicator:
   - Green checkmark: completed (before current)
   - Blue dot pulsing: current day
   - Grayed lock: locked (after current)
7. On day click: navigate to /session/:dayId
```

### ProgressPage: Learning Record

**Trigger:** User visits `/progress`

```
1. Fetch stats from server via getStats(roadmapId)
2. While loading → show spinner
3. On error → show error message with retry button
4. On success → display:
   - Summary stats: lessons completed, exams passed, revision sessions
   - Outcome stats: last completed topic, latest session outcome, latest exam score
   - Weak topics list (revision queue): topics failed in exams
   - Completion breakdown by module/week
5. Stats auto-update when user returns from session
```

### SessionPage: Learning Session Orchestrator

**Trigger:** User clicks a day on roadmap or session card on dashboard → navigate to `/session/:dayId`

```
PHASE 1: LOAD SESSION
- Fetch session data: getSession(dayId, roadmapId)
- If session.type === "Exam" → jump to ExamPhase
- Else → start at LessonPhase

PHASE 2: LESSON (lecture delivery)
- Display lesson parts sequentially (part 1, 2, 3...)
- Each part has multiple cards (slide-like)
- Progress bar shows % of cards completed
- After last card of part → show mini exercise
- Mini exercise: MCQ with immediate feedback (green if correct, red if wrong)
- User clicks "Next Part" or "Finish Lesson" when mini is done
- All parts done → advance to Task phase

PHASE 3: TASK (applied practice)
- Two types: text-based or MCQ
- Text: user writes answer (min 20 chars), AI evaluates and provides feedback
- MCQ: user answers questions, all submitted together for scoring
- On submit → backend returns { feedback, outcome, score?, passed? }
- Advance to Feedback phase

PHASE 4: FEEDBACK (AI-generated guidance)
- Display outcome badge: "Excellent Progress!" or "Keep Working on It"
- Show detailed AI feedback in markdown format
- List relevant learning resources if available
- User clicks "Continue to Next Day" → progress advances, navigate to /learn

PHASE 5: EXAM (weekly assessment)
- Multiple-choice questions with topic tags
- Progress bar shows % answered (red color)
- All questions required before submit
- On submit → backend grades, returns { score, passed, feedback, weakTopics }
- Advance to Result phase

PHASE 6: RESULT (exam outcome)
- Pass: green card, congratulations message, "Continue to Next Week" button
- Fail: red card, weak topics listed, "Back to Revision" button
- On continue/back → progress advances if pass, or stays same if fail
- Navigate to /learn

ERROR HANDLING:
- Session load fails → show error modal, offer "Try Again" or "Back to Dashboard"
- Phase submission fails → show inline error, allow retry
```

**Key design:** SessionPage acts as a **phase state machine**. It never shows multiple phases at once; it maintains one active phase and transitions explicitly. Each phase component (LessonPhase, TaskPhase, etc.) is a self-contained UI orchestrator that calls `onComplete(payload)` to trigger the next phase.

## Key Design Decisions

### 1. **Page-level data fetching vs. global context**
**Decision:** Pages fetch their own data in useEffect, not relying solely on global AppContext.

**Why:** Ensures fresh data on page mount. Global context provides baseline (active roadmap), but pages fetch additional data like progress stats. Prevents stale data bugs.

**Alternative considered:** All data in global context. Would require careful invalidation logic and cache strategy.

### 2. **Full-page loading states (spinner, empty, error)**
**Decision:** Each page renders three distinct states: loading, empty/not-ready, data-ready. States are mutually exclusive.

**Why:** Clear UX pattern. User always knows why page is blank or when to retry. Prevents confusion from partially-loaded UI.

**Alternative considered:** Progressive rendering (show UI skeleton, fill in data). More complex; benefits unclear for this app.

### 3. **SessionPage as phase state machine**
**Decision:** SessionPage maintains a single `phase` state. Each phase component is self-contained and calls `onComplete()` to trigger the next phase.

**Why:** Prevents race conditions and concurrent phase states. Clear phase order. Easy to add new phases (insert in PHASES, add handler, add phase case in JSX).

**Alternative considered:** Each phase manages its own state/routing. Led to bugs where multiple phases could render, or user could navigate back unexpectedly.

### 4. **Error message extraction utility**
**Decision:** `extractErrorMessage(err, fallback)` standardizes error handling across pages.

**Why:** Axios errors have inconsistent shapes. Centralize extraction logic to avoid repeating `err?.response?.data?.error`. Provides network error handling ("cannot connect") automatically.

**Alternative considered:** Inline extraction. Verbose and error-prone.

### 5. **Mini exercises as instant-feedback checkpoints**
**Decision:** Mini exercises shown after each lesson part, with immediate correct/incorrect feedback, before moving to task.

**Why:** Improves retention; user confirms understanding before moving on. Low-stakes (not graded). Psychological momentum.

**Alternative considered:** No mini exercises, only formal task. Reduces learning efficacy; users might miss gaps.

### 6. **Text task submission minimum length (20 chars)**
**Decision:** Text answers must be ≥ 20 characters.

**Why:** Prevents one-word answers ("yes", "no"). Encourages thoughtful responses for AI evaluation. Configurable threshold.

**Alternative considered:** No minimum. Too permissive; AI feedback becomes less meaningful.

## Data Flow

### AuthPage Data Flow
```
User input (email, password)
    ↓
Validation (email format, password length)
    ↓
useAuth().login() / signup()
    ↓
POST /auth/login or /auth/signup
    ↓
Response: { token, user, hasRoadmap }
    ↓
localStorage.setItem('sm_token', token)
    ↓
AuthContext updated { user, hasRoadmap }
    ↓
Navigation: /learn or /setup
```

### LearnPage Data Flow
```
useApp() reads global state
    ↓
{ roadmapJson, progress, roadmapLoading }
    ↓
If loading → spinner
    ↓
If !roadmapJson → empty state
    ↓
Else: extract current session via getCurrentSession(roadmapJson, progress)
    ↓
Map progress.currentModule → roadmapJson.modules[]
    ↓
Map progress.currentWeek → module.weeks[]
    ↓
Map progress.currentDay → week.days[], match by dayName
    ↓
Render current session card + stats
```

### SessionPage Data Flow
```
URL param: dayId
    ↓
useEffect fetches: getSession(dayId, roadmapId)
    ↓
Response: { session: { type, title, content: { parts }, questions } }
    ↓
State: phase = LESSON (or EXAM if type is Exam)
    ↓
[LESSON PHASE]
  Render LessonPhase with parts[]
    ↓
  User completes all parts + mini exercises
    ↓
  handleLessonComplete() → phase = TASK
    ↓
[TASK PHASE]
  Render TaskPhase with task object
    ↓
  User submits answer → submitTask(dayId, { type, taskAnswer/mcqAnswers })
    ↓
  Response: { feedback, outcome, score?, passed?, resources? }
    ↓
  handleTaskComplete(payload) → setFeedbackData(), phase = FEEDBACK
    ↓
[FEEDBACK PHASE]
  Render FeedbackPhase with feedback, outcome, resources
    ↓
  User clicks "Continue" → advanceProgress(roadmapId, dayId, 'completed')
    ↓
  Navigate to /learn
    ↓
[EXAM PHASE] (alternative path if session.type === Exam)
  Render ExamPhase with questions[]
    ↓
  User answers all questions → submitExam(dayId, { answers[] })
    ↓
  Response: { score, passed, feedback, weakTopics }
    ↓
  handleExamComplete() → setExamResult(), phase = RESULT
    ↓
[RESULT PHASE]
  Render ExamResult with score, passed, weakTopics
    ↓
  User clicks "Continue" or "Back to Revision" → handle navigation
```

## Dependencies

### Depends On:
- `../context/AppContext` — Active roadmap, progress, and refresh methods
- `../context/AuthContext` — User authentication state and methods
- `../api/auth.api` — Login, signup, get user info
- `../api/roadmap.api` — Generate roadmap, fetch active roadmap
- `../api/session.api` — Fetch session, submit task, submit exam
- `../api/progress.api` — Fetch stats, advance progress
- `../components/ui/*` — Button, Card, Badge, LoadingSpinner, etc.
- `../components/layout/AppShell` — Page container wrapper
- `../hooks/useAuth`, `useApp` — Access to auth and app context
- `react-router-dom` — useNavigate, useParams, Navigate
- `react-markdown` — Render markdown content in lesson/feedback
- `react-icons` — SVG icons for UI (HiCheckCircle, HiLockClosed, etc.)

### Depended On By:
- `../routes/ProtectedRoute` — Protects pages that require authentication
- App routing configuration — Maps `/auth`, `/learn`, etc. to pages
- Main App.jsx — Uses pages as route targets

## Common Mistakes / Gotchas

1. **Not checking loading state before accessing data**
   - ❌ Don't: `const { roadmapJson } = useApp(); return <div>{roadmapJson.skillName}</div>` (crashes during load)
   - ✅ Do: `if (roadmapLoading) return <Spinner />; if (!roadmapJson) return <EmptyState />;`

2. **Infinite loops from missing dependencies in useEffect**
   - ❌ Don't: `useEffect(() => { fetchData(); }, [])` when fetchData references props that change
   - ✅ Do: `useEffect(() => { ... }, [dayId, roadmapId])` — list all external dependencies

3. **Async errors in event handlers not caught**
   - ❌ Don't: `const handleSubmit = async () => { await api.call(); navigate('/'); }` without try/catch
   - ✅ Do: Always wrap async calls in try/catch; set error state and show user feedback

4. **Navigating away before async operation completes**
   - ❌ Don't: `advanceProgress(...); navigate('/learn')` without awaiting
   - ✅ Do: `await advanceProgress(...);` then navigate, or mark as "non-fatal" if navigation doesn't require success

5. **Re-rendering loops from setting state in render**
   - ❌ Don't: In component body (not in useEffect), call `setPhase()` or `setError()`
   - ✅ Do: Only set state in event handlers or useEffect

6. **Passing children to SessionPage phases without unique keys**
   - ❌ Don't: `{parts.map(p => <Part ... />)}` without key prop
   - ✅ Do: `{parts.map((p, i) => <Part key={i} ... />)}` or better, `key={p.partNumber}`

7. **Forget to clear error state when retrying**
   - ❌ Don't: `<Button onClick={() => handleSubmit()} />` which sets state but doesn't clear old errors
   - ✅ Do: Clear errors at the start of async operations: `setError(null); setLoading(true);`

8. **Week/day lookup failure in LearnPage**
   - ❌ Issue: `getCurrentSession()` returns null if week/day numbers don't match roadmapJson structure
   - ✅ Fix: The function has fallback logic (0-indexed lookup), but verify roadmap JSON week/day numbering is consistent

## Extension Points

### Adding a New Page

1. **Create folder:** `/pages/NewPage/`
2. **Create page component:** `NewPage.jsx`
   ```jsx
   import { useNavigate } from 'react-router-dom';
   import { useAuth } from '../../hooks/useAuth';
   
   export default function NewPage() {
     const { user } = useAuth();
     const navigate = useNavigate();
     
     // Fetch data, render UI, handle interactions
   }
   ```
3. **Register route:** Add to routing configuration (typically in App.jsx or routes file)
   ```jsx
   <Route path="/new" element={<NewPage />} />
   ```
4. **Update navigation:** Add links in Navbar or other navigation components

### Adding a New SessionPage Phase

1. **Create phase component:** `SessionPage/phases/NewPhase.jsx`
   ```jsx
   export default function NewPhase({ phaseData, dayId, roadmapId, onComplete }) {
     const handleSubmit = () => {
       const payload = { /* data for next phase */ };
       onComplete(payload);
     };
     return <div>...</div>;
   }
   ```
2. **Add phase constant:** In SessionPage, add to PHASES object:
   ```js
   const PHASES = { ..., NEW: 'new' };
   ```
3. **Add phase handler:** In SessionPage, add handler:
   ```js
   const handleNewComplete = (payload) => {
     setStateForNextPhase(payload);
     setPhase(PHASES.NEXT);
   };
   ```
4. **Add phase case:** In SessionPage JSX:
   ```jsx
   {phase === PHASES.NEW && <NewPhase ... onComplete={handleNewComplete} />}
   ```

### Modifying Page Data Fetching

- Change API endpoint: Update import path in page file
- Add new data field: Add useEffect, call API, update useState
- Add loading state for new data: Add separate loading flag (e.g., `statsLoading`), render conditional UI
- Handle new error types: Check error shape, add to `extractErrorMessage()` if pattern is new

### Extending Error Handling

- Create custom error class in `/utils/errors.js` if error types become complex
- Add error boundary around pages to catch render errors
- Log errors to monitoring service (Sentry, etc.) for production debugging
