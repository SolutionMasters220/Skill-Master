# Home View Design
## Skill Master — Home / Learn Dashboard View Specification

**Document Type:** View design specification  
**Project:** Skill Master  
**View Name:** Home View  
**Primary Route:** `/learn`  
**Design Status:** Refined and approved direction based on review  
**Purpose:** Define the main in-app home screen as a clean, professional, mobile-first control view that shows only the learner’s current point, current session, and immediate learning context without overlapping with the Progress Dashboard or the Session View.

---

# 1. View Identity

## View Name
**Home View**

## Route
```text
/learn
```

## Core Purpose
This view exists to:

- act as the learner’s main in-app home screen
- show the learner’s **current point** only
- show the learner’s **current session summary**
- guide the learner into the active learning session
- provide quick access to roadmap, progress dashboard, and profile actions

This view is not meant to display full history, full analytics, or lesson execution.

---

# 2. Design Philosophy

The Home View should feel:

- like the learner’s main in-app screen
- clean and app-like
- professional rather than textbook-like
- focused on current state, not too much history
- mobile-first and easy to scan

It should avoid:

- long explanatory text
- duplicated progress analysis
- lesson content blocks
- task submission controls
- cluttered dashboard widgets

## Main UX Goal
When the learner opens this screen, the learner should quickly understand:

> Where am I right now?
> What is my current session?
> What should I do next?

---

# 3. Shared Layout / App Shell Context

This view lives inside the **shared authenticated app layout**.

## Shared Top Navigation
The top navigation is visible on the main protected screens.

### Navigation Links
- **Home**
- **Roadmap**
- **Progress**

### Right-side Controls
- **Mode Toggle** *(light / dark mode option if implemented)*
- **Profile Trigger**

---

## Profile Area
The profile interaction should not be a separate page.
It should open as a dropdown or modal-style surface from the top bar.

### Profile Surface Content
- user name
- short user description
- logout action

### Example profile description
**Learning MERN Stack**

## Intentionally Excluded From Profile Surface
- no Edit Learning button for now
- no full settings page for MVP

---

## Why this shared layout is important
It gives the learner a stable in-app structure:
- Home for current state
- Roadmap for structure
- Progress for stats/history
- Profile for lightweight account actions

---

# 4. Header Design

## Main Title
**Dashboard**

## Supporting Phrase
**Pick up where you left off.**

## Why this wording works
- short and professional
- app-like rather than educational-book style
- immediately communicates continuation
- fits both new and returning learners

## Optional Context Line
A very small context line may appear below the subtitle if needed:

**Current Skill: MERN Stack**

This line is optional and should be subtle.

---

# 5. Final Role Separation

## This view does
- show the current learning point
- show the current session summary
- show the immediate next action
- show lightweight revision context if needed

## This view does NOT
- show full lesson content
- collect task input
- request AI feedback
- conduct the exam
- show full history and advanced stats
- show full upcoming roadmap breakdown

## Why this matters
This keeps the role of each major screen clean:
- **Home** = current state and next action
- **Roadmap** = structure
- **Progress** = deeper stats and learning record
- **Session** = actual lesson/task execution

---

# 6. Final Home View Structure

The Home View should contain these main sections:

1. **Page Header**
2. **Current Point Summary**
3. **Current Session Card**
4. **Revision Queue (light summary)**

## Important Removal Decision
The older idea of a broad “Recent Progress” section is removed from Home.

### Reason
- it starts overlapping with the Progress Dashboard
- it makes Home feel duplicated
- Home should stay focused on the present moment

---

# 7. Section 1 — Current Point Summary

## Purpose
This section gives the learner a quick snapshot of the exact current learning position.

## This section should answer
- Which module am I in?
- Which week is active?
- Which day is active?
- Do I currently have revision items pending?

---

## Recommended UI Pattern
Compact stat cards / summary boxes

## Final Cards
1. **Current Module**
2. **Current Week**
3. **Current Day**
4. **Revision Queue**

## Example card values
- Module 1
- Week 2
- Day 3
- Revision: 2 topics

## Design Rule
This section should be small, fast to scan, and not overloaded with detail.
It is only about the **current point**, not the full progress story.

### Mobile Layout
- 2 cards per row
- compact grid

### Desktop Layout
- 4 cards in one row

---

# 8. Section 2 — Current Session Card

## Purpose
This is the main focus of the Home View.
It tells the learner exactly what the active session is and provides the main action to continue.

## Section Title
**Current Session**

## This card should show

### 1. Session Title
Example:
- Introduction to Components
- Props Basics
- Week 1 Revision
- Weekly Exam

### 2. Current Day Label
Example:
- Day 3
- Monday

### 3. Session Type Badge
Possible values:
- Learning
- Revision
- Exam

### 4. Estimated Time
Example:
- 30 min
- 45 min
- 1 hour

### 5. Current Status
Possible values:
- Not Started
- Ready to Continue
- In Progress

### 6. One-line Session Description
This should be short and helpful.
It should not become a lesson preview.

#### Example
**Continue with the basics of React components.**

---

## Primary Button
**Continue Session**

## Why this button text is correct
This screen is not where the task is performed.
The button should clearly move the learner into the actual work area.

So:
- not “Submit Task”
- not “Start Learning”
- not “Do Lesson”
- **Continue Session** is the correct level of action

## Button Behavior
```text
/learn → /session/:dayId
```

---

# 9. Section 3 — Revision Queue (Light Summary)

## Purpose
To remind the learner that some topics were flagged for revision.

## Important Rule
This section should stay lightweight on Home.
It should not become a deep management area.

## Section Title
**Revision Queue**

## What to show
A simple list of topics, for example:
- React Props
- JSX Basics
- Component Structure

### Optional extra information
- source week/day if space allows

### Example
- React Props — Week 1
- JSX Basics — Exam Review

---

## Interaction Level
For MVP, this section should stay mostly informational.

### Recommendation
- no heavy per-item action buttons
- no deep revision workflow from Home
- simply show the learner what is waiting in revision

## Why keep it light?
Because the Home View should remain current-state focused and not become another complex management screen.

---

# 10. What Was Intentionally Removed From Home

To keep Home clear and non-duplicative, the following are intentionally excluded:

- no full lesson content
- no task input fields
- no feedback panel
- no exam questions
- no “Recent Progress” history block
- no upcoming roadmap breakdown
- no full analytics charts
- no detailed weak-topic analysis

## Where these belong instead
- lesson / task / feedback / exam → **Session View**
- roadmap structure → **Roadmap View**
- learning history / statistics / broader tracking → **Progress Dashboard**

---

# 11. Empty and Edge States

## Empty State 1 — No Roadmap
If the learner reaches Home without a roadmap:
- title: **No roadmap available**
- text: **Create your roadmap to begin your guided learning flow.**
- action: **Create Roadmap**
- destination: `/setup`

## Empty State 2 — No Current Session
If roadmap exists but current session cannot be resolved:
- title: **No active session found**
- text: **Return to your roadmap or refresh your learning state.**
- actions:
  - View Roadmap
  - Refresh

## Empty State 3 — No Revision Topics
If revision queue is empty:
- small helper text:
  **No revision topics yet**

---

# 12. Mobile Design Rules

## Core Mobile Rules
- vertical stacked layout
- summary cards compact and readable
- current session card must be the strongest section visually
- revision queue appears below the current session card
- no side-by-side complex section layout
- primary button should be easy to tap

## Mobile Order
```text
Header
→ Current Point Summary
→ Current Session Card
→ Revision Queue
```

## Important Mobile Goal
The learner should understand the screen in a few seconds without needing to scroll through unnecessary text.

---

# 13. Desktop Design Rules

## Desktop Layout Recommendation
```text
Header
→ Current Point Summary Row
→ Current Session Card
→ Revision Queue Section
```

## Notes
- summary cards appear in a single row
- current session card should remain the visual focus
- revision queue can appear below in a compact panel
- keep the layout breathable and app-like

---

# 14. Relationship With Other Views

## `/roadmap`
Shows the full structure of modules, weeks, and days.

## `/learn`
Shows the learner’s current state and next action.

## `/progress`
Shows deeper tracking, broader statistics, previous and upcoming records, and dashboard-style progress details.

## `/session/:dayId`
Shows the actual session workspace:
- lesson content
- task execution
- answer input
- feedback
- completion
- exam mode

This role separation must remain strict.

---

# 15. Functional Decisions Locked in This Proposal

If this design is approved, the following decisions are considered locked:

- Home View uses the shared authenticated layout
- top navigation contains Home, Roadmap, Progress, and profile trigger
- profile surface contains user name, short skill description, and logout
- mode toggle may appear in shared top bar
- page title is **Dashboard**
- supporting phrase is **Pick up where you left off.**
- Home View shows only current-point information
- Home View contains current progress summary
- Home View contains a strong current session card
- Home View contains a light revision queue
- Home View does not contain full history or progress dashboard analytics
- main CTA is **Continue Session**
- CTA navigates to `/session/:dayId`

---

# 16. Textual Wireframe Preview

```text
/learn

[ Shared Top Navbar ]
  Skill Master | Home | Roadmap | Progress | Mode Toggle | Profile

[ Header ]
  Dashboard
  Pick up where you left off.

[ Current Point Summary ]
  [ Current Module: 1 ]
  [ Current Week: 2 ]
  [ Current Day: 3 ]
  [ Revision Queue: 2 ]

[ Current Session Card ]
  Current Session
  Introduction to Components
  Day 3 — Learning
  Estimated Time: 45 min
  Status: Ready to Continue
  Continue with the basics of React components.
  [ Continue Session ]

[ Revision Queue ]
  - React Props
  - JSX Basics
```

---

# 17. Final Summary

The Home View is designed to be:

- the learner’s main in-app home screen
- current-state focused
- clean and professional
- mobile-first
- clearly separate from lesson execution
- clearly separate from the Progress Dashboard

This design ensures that the learner always knows where they are, what the current session is, and what the next action should be — without turning the page into a second session screen or a duplicate progress screen.

---
