# Session View Design
## Skill Master — Session / Learning Arena Specification

**Document Type:** View design specification  
**Project:** Skill Master  
**View Name:** Session View  
**Route:** `/session/:dayId`  
**Design Status:** Finalized direction — guided lesson flow with mini MCQs, one final task, and AI-assisted evaluation  
**Purpose:** Define the core learning workspace where the learner studies the day’s lesson, completes mini understanding checks, performs the final task of the day, receives feedback, and gets a clear session outcome.

---

# 1. View Identity

## View Name
**Session View**

## Route
```text
/session/:dayId
```

## Core Purpose
This view exists to:

- deliver the full lesson experience for the current day
- guide the learner through the lesson in structured stages
- check understanding using lightweight mini exercises
- present one final task of the day
- evaluate the learner’s final submission
- generate meaningful feedback
- identify weak topics and send them for revision handling
- move the learner back into the main app flow with a clear result

This view is the **main learning arena** of Skill Master.

---

# 2. Why This View Matters

This is the screen where the app proves its real value.

The learner should feel that:

- the lesson is structured and guided
- the explanation is useful and not random
- understanding is checked progressively
- the final task feels connected to what was learned
- the feedback is helpful and specific
- weak areas are being captured intelligently

This page is where the learner experiences the product, not just navigates it.

---

# 3. Shared Layout / App Shell Context

The Session View lives inside the **shared authenticated app layout**.

## Shared Top Navigation
The same top bar remains available here:
- **Home**
- **Roadmap**
- **Progress**
- **Mode Toggle** *(optional if implemented)*
- **Profile Trigger**

## Profile Surface
Profile actions remain lightweight and outside the learning arena.

Possible items:
- user name
- short current skill line
- logout

## Design Note
Even though the shared top bar remains visible, the Session View should still feel focused and immersive.
The learning arena below it should be the visual center of attention.

---

# 4. Core Session Model

The Session View should behave like a guided learning flow inside one evolving page.

## Main Session Modes
The same page should evolve through these modes:

1. **Lesson Mode**
2. **Task Mode**
3. **Evaluation Mode**

### Meaning of this decision
The page should not feel like separate disconnected screens.
Instead, it should feel like one learning flow that changes state as the learner progresses.

---

# 5. Main Layout Direction

## Mobile-First Layout
The session should be designed mobile-first with a vertical flow:

```text
[ Shared Top Bar ]
[ Session Header ]
[ Main Session Container ]
   → Lesson Mode
   → Task Mode
   → Evaluation Mode
```

## Desktop Layout
Desktop should keep the same logical structure.
It may become wider and more spacious, but it should still remain one focused learning arena.

### Important Recommendation
Do not turn the page into a complicated multi-panel workspace.
The learner should still experience a single primary flow.

---

# 6. Session Header

## Purpose
The Session Header gives immediate context about the current learning session.

## It should show

### 1. Session Title
Examples:
- Introduction to Components
- Props Basics
- Week 1 Revision
- Weekly Check

### 2. Session Position
Example:
- Module 1 • Week 2 • Day 3

### 3. Session Type Badge
Possible values:
- Learning
- Revision
- Exam

### 4. Estimated Time
Example:
- 45 min
- 1 hour

### 5. Back Action
- **Back to Home**

## Visual Role
The session title should appear as the main heading in the learning arena so the learner feels:

> this is my focused learning space for today

---

# 7. Main Session Container

## Purpose
This is the primary learning arena where the actual experience happens.

## Design Intention
The main container should feel like a dedicated learning space separated from the rest of the app.
It should visually hold the entire day’s experience.

## Internal Evolution
The same container should transition through:
- lesson flow
- final task flow
- evaluation / result flow

The container should **evolve**, not endlessly grow into a giant unstructured page.

---

# 8. Lesson Mode

## Purpose
Lesson Mode teaches the learner the day’s concept before the final task.

## Final Lesson Structure
Lesson Mode is divided into **3 stages**:

1. **Introduction**
2. **Core Understanding**
3. **Deep Dive**

### Why this works
This creates a progression:
- first understanding what the topic is
- then understanding how it works
- then going slightly deeper for stronger conceptual clarity

---

# 9. Lesson Stage Content Model

Each lesson stage will contain an array of **content cards**.

## Important Final Decision
The number of cards is **not rigidly fixed**.
It will depend on the lesson itself.

### Meaning
The AI/content generator may decide:
- Introduction = 1 card
- Core Understanding = 3 cards
- Deep Dive = 4 cards

As long as the backend returns a structured array, the frontend can render the cards predictably.

## Why this approach is better
- keeps the structure flexible
- avoids forcing every lesson into an unnatural size
- still keeps frontend rendering simple
- supports richer lessons when needed without redesigning the UI

---

## Each Lesson Card Can Contain
- a small heading
- a short explanation block
- a key point
- an example
- a note or relevance message

## Rendering Rule
Frontend should simply render the stage’s cards array in order.
The UI does not need to guess lesson structure.

---

# 10. Navigation Inside Lesson Mode

## Purpose
Let the learner move step by step through the cards inside the current stage.

## Controls
- **Next**
- **Previous**

## Behavior
- cards are shown one at a time or in a controlled stage flow
- learner moves card by card using Next / Previous
- once the learner reaches the end of the current stage, the mini exercise for that stage appears

## Important Note
Previous/Next is for content navigation inside a stage.
It is not for jumping between app pages.

---

# 11. Mini Exercises During Lesson Mode

## Purpose
Check understanding progressively during the lesson without requiring AI evaluation.

## Final Decision
Mini exercises inside lesson mode will be **MCQs only**.

### Why this is the best MVP choice
- answers are already known
- frontend can validate instantly
- no AI call is needed
- learner engagement improves
- progression feels more interactive and structured

---

## Mini Exercise Placement
A mini MCQ block appears **after each lesson stage**:

- after Introduction
- after Core Understanding
- after Deep Dive

## Difficulty Progression
The difficulty can change by stage:

- Introduction MCQs → basic
- Core MCQs → moderate
- Deep Dive MCQs → more thoughtful or tricky

## Progression Rule
The learner should finish the current stage’s mini exercise before continuing deeper.

### Important Distinction
Mini MCQs are **lesson checks**, not the final day result.
They help the learner move through the lesson flow.

---

# 12. Additional Resources Section

## Purpose
Offer extra learning material without distracting from the main session flow.

## Final Decision
Additional resources should remain a **secondary, optional section**.
They should not become the main focus.

## Recommended Placement
Near the end of Lesson Mode or after the final lesson stage.

## Recommended Label
**Explore More**
or
**Additional Resources**

## Content
- 2–3 relevant links maximum
- optional article/video/documentation references

## Important Rule
This section should feel like extra support, not the main course of the session.

---

# 13. Transition From Lesson Mode to Task Mode

## Purpose
After the learner completes the 3 lesson stages and their mini MCQs, the page should shift into final task mode.

## Design Principle
The page should not feel like a brand-new screen.
The main learning container simply changes from teaching mode into application mode.

---

# 14. Task Mode

## Purpose
The final task is where the learner applies the full session’s learning.
This is the main performance checkpoint of the day.

## Final Decision
There will be **one final task only** for the MVP.

### Why one task is better
- easier to understand
- easier to evaluate
- less UI complexity
- stronger completion clarity
- better fit for MVP and FYP scope

---

## Task Personalization Rule
The task structure remains fixed, but the **content** of the task may adapt to the learner’s preference.

### Examples
- theory-focused learner → more explanation-oriented task
- practical-focused learner → more implementation/scenario-oriented task
- mixed learner → blended task style

## Important Principle
The structure is fixed.
Only the content changes.

---

# 15. Task Mode UI Structure

## This section should show

### 1. Task Heading
**Task of the Day**

### 2. Task Description
A short clear description of what the learner needs to do.

### 3. Estimated Time
Example:
- 15 min
- 20 min

### 4. Hint Trigger
A lightweight action such as:
- **Show Hint**

### 5. Answer Input Area
A single **textarea**

### 6. Main Submission Button
- **Submit Answer**

---

## Final Decision for Input Type
The final task input area will be **textarea only**.

### Why textarea is best for MVP
- works for theory-based tasks
- works for practical explanation tasks
- works for mixed tasks
- keeps frontend predictable
- avoids rendering many final input patterns

---

## Hidden Hint Rule
The hint should be hidden by default.
The learner only sees it after choosing to open it.

### Why this is useful
- support is available
- screen stays cleaner
- hint does not dominate the task section

---

# 16. Submission Flow

## Final Submission Logic
The learner completes the task and clicks:

**Submit Answer**

After that, the system should do the following:

1. receive the learner’s answer
2. send it for AI-assisted evaluation
3. analyze strengths and weaknesses
4. determine session outcome
5. identify weak topics
6. send weak topics to backend for revision handling
7. update progress through backend validation

---

# 17. Evaluation Mode

## Purpose
This is the feedback and decision zone of the session.
This is where the learner sees the result of the day’s work.

## This section should show

### 1. Feedback Summary
A short overall summary of how the learner performed.

### 2. Strengths
What the learner did correctly.

### 3. Improvements
What the learner missed or can improve.

### 4. Session Outcome
Possible values:
- Passed
- Needs Revision
- Retry Suggested

### 5. Weak Topics Added
List of weak areas that were identified and passed into revision handling.

---

## Feedback Design Rule
Feedback should feel:
- useful
- specific
- short enough to scan
- encouraging but honest
- not robotic
- not essay-like

---

# 18. AI Evaluation Role

## Final Decision
AI helps determine the quality of the final task submission.

It may decide:
- whether the learner’s answer is strong enough
- whether the session can be considered complete
- what weak topics should be captured
- whether revision is needed

## Important UI Rule
Even if AI helps with evaluation, the learner should receive a **clear deterministic outcome**:
- Passed
- Needs Revision
- Retry Suggested

The result should never feel vague.

---

# 19. Revision Queue Handling

## Final Decision
Revision queue updates are **system-driven**, not manually controlled by the learner.

### Meaning
If the evaluation detects weak areas:
- those topics are added to revision handling automatically
- the learner is informed about which topics were added

## Session UI Behavior
The learner should see a small section such as:

**Weak Topics Added**
- JSX Return
- Props Basics

### Important
The learner does not manually choose revision topics here.

---

# 20. Final Outcome / Next Action

## Purpose
After feedback is shown, the learner must clearly understand what happens next.

## Outcome Cases

### Passed
- session completed successfully
- learner can return to Home

### Needs Revision
- session identified weak areas
- revision queue updated
- learner returns to Home

### Retry Suggested
- learner may retry if desired
- or return to Home

---

## Recommended Primary Next Action
**Return to Home**

### Why this is best
- dashboard/home will show updated state
- learner returns to the main control screen
- overall app flow stays clean

### Optional secondary action for retry case
- **Try Again**

For MVP, this secondary action can remain optional.

---

# 21. Exam Mode Inside the Same View

## Final Decision
Exam mode uses the **same Session View**.
There is no separate exam page.

## If Session Type = Exam
The learning arena changes into exam mode.

### Exam Mode Contains
- exam title
- short instructions
- MCQ questions
- submit exam button
- result summary after submission

## Result After Exam
Show:
- score
- pass/fail
- weak topics
- next state
- Return to Home button

This keeps the app simpler and the route structure cleaner.

---

# 22. Mobile Design Rules

## Core Mobile Rules
- full vertical flow
- lesson content must remain readable
- task textarea must be full width
- MCQ options must be thumb-friendly
- submit button must be clear and large enough
- evaluation block must feel visually separate
- section spacing must be strong to avoid crowding

## Important Mobile Goal
Even though this is the richest page in the app, it should still feel controlled and understandable on mobile.

---

# 23. Desktop Design Rules

## Desktop Recommendation
Keep the session experience mostly vertical even on desktop.

### Why?
- easier to build
- more consistent with mobile
- fewer layout bugs
- clearer learning flow

Some meta information may sit compactly beside or above the content, but the learner should still experience one main learning arena.

---

# 24. What Is Intentionally Excluded

To keep Session View focused and buildable, the following are intentionally excluded:

- no public discussion/comments
- no peer comparison
- no chat panel
- no multiple task history log
- no manual revision queue controls
- no heavy analytics charts
- no long AI essay-style evaluation
- no separate exam route

---

# 25. Relationship With Other Views

## `/learn`
Shows current state and session entry.

## `/session/:dayId`
Handles full lesson, task, feedback, and outcome.

## `/roadmap`
Shows roadmap hierarchy only.

## `/progress`
Shows broader statistics and deeper tracking.

This role separation must remain strict.

---

# 26. Functional Decisions Locked in This Proposal

If this design is approved, the following decisions are considered locked:

- Session View is the main learning arena
- Session View uses the shared authenticated layout
- lesson flow is divided into 3 stages:
  - Introduction
  - Core Understanding
  - Deep Dive
- each stage contains a cards array
- number of cards is flexible and content-driven
- mini exercises after each stage are MCQ only
- mini MCQs do not require AI evaluation
- one final task only is used per session
- final task input type is textarea only
- hint is hidden until requested
- AI evaluates the final task
- AI helps determine session outcome and weak topics
- revision queue is system-driven
- same page evolves from Lesson Mode → Task Mode → Evaluation Mode
- exam mode uses the same session page
- main next action after evaluation is **Return to Home**

---

# 27. Textual Wireframe Preview

```text
/session/:dayId

[ Shared Top Navbar ]
Skill Master | Home | Roadmap | Progress | Mode Toggle | Profile

[ Session Header ]
Introduction to Components
Module 1 • Week 2 • Day 3
Learning • 45 min
[ Back to Home ]

[ Main Session Container ]

  Lesson Mode
    Stage 1 — Introduction
      Card 1
      Card 2
      Mini MCQ

    Stage 2 — Core Understanding
      Card 1
      Card 2
      Card 3
      Mini MCQ

    Stage 3 — Deep Dive
      Card 1
      Card 2
      Card 3
      Card 4
      Mini MCQ

    [ Additional Resources ]

  Task Mode
    Task of the Day
    Task description
    Estimated time
    [ Show Hint ]
    [ Textarea ]
    [ Submit Answer ]

  Evaluation Mode
    Feedback Summary
    Strengths
    Improvements
    Outcome: Passed / Needs Revision / Retry Suggested
    Weak Topics Added
    [ Return to Home ]
```

---

# 28. Final Summary

The Session View is designed to be:

- the core value-delivery screen of the app
- guided and structured
- lesson-first and task-driven
- predictable for frontend implementation
- flexible in lesson size through card arrays
- simple enough for MVP
- strong enough to demonstrate meaningful educational value

This design keeps the structure fixed while allowing the actual lesson content to remain flexible and personalized.

---
