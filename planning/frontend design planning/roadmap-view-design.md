# Roadmap View Design
## Skill Master — Roadmap View Specification

**Document Type:** View design specification  
**Project:** Skill Master  
**View Name:** Roadmap View  
**Route:** `/roadmap`  
**Design Status:** Approved direction — 3-section roadmap canvas with guided entry to learning  
**Purpose:** Define the roadmap screen as a clean, read-only orientation view that helps the learner understand the learning structure before moving into the main learning flow.

---

# 1. View Identity

## View Name
**Roadmap View**

## Route
```text
/roadmap
```

## Core Purpose
This view exists to:

- display the generated roadmap clearly
- help the learner understand the overall learning structure
- show the learner’s current position inside the roadmap
- provide a simple entry point into the actual learning flow

This view is an **orientation screen**, not an execution screen.

---

# 2. Design Philosophy

The Roadmap View should feel:

- structured
- calm
- readable
- non-overwhelming
- guided
- clearly separated from actual learning execution

It should avoid:

- large blocks of lesson content
- task input areas
- unnecessary controls
- dashboard-like clutter
- heavy card stacking for every day item

## Main UX Goal
When the learner opens this screen, the learner should understand:

> This is my learning plan.
> I can see my modules, my current week, and what lies ahead.
> I can now move into the guided learning flow.

---

# 3. What This View Is and Is Not

## This View Is
- a roadmap overview page
- a read-only structure page
- a guided transition point before entering learning flow

## This View Is Not
- not the dashboard
- not the session page
- not the task execution page
- not the progress analysis page
- not the AI interaction page

This distinction must remain clear in both design and implementation.

---

# 4. Final Layout Direction

## Approved Direction
A **3-section roadmap canvas** with one focused call-to-action at the end.

### Structure
The view will have:

1. a **header**
2. a **summary card**
3. a **3-section roadmap canvas**
4. a **single primary action button**

---

# 5. Responsive Layout Behavior

## 5.1 Mobile-First Layout
This view must be designed mobile-first.

### Mobile order
```text
Header
→ Summary Card
→ Modules Section
→ Weeks Section
→ Days List Section
→ Get Started Button
```

### Why this order?
This keeps the hierarchy clear:
- first, the learner sees the roadmap context
- then top-level modules
- then the weeks of the active module
- then the days of the active week
- finally, the learner is guided into the learning flow

---

## 5.2 Desktop Layout
On desktop, the same structure remains, but sections become more spacious and better aligned.

### Desktop order
```text
Header
→ Summary Card
→ Modules Section
→ Weeks Section
→ Days List Section
→ Get Started Button
```

### Important Layout Rule
Even on desktop, this should remain a **focused roadmap view**, not a dashboard.

There should be:
- no side panel with analytics
- no lesson preview panel
- no split layout with execution controls

---

# 6. Header Design

## Main Title
**Your Learning Roadmap**

## Supporting Subtitle
**Here is the structured plan based on your goal and preferences.**

## Purpose
The header should immediately tell the learner that:
- this is their generated roadmap
- the plan is already structured
- this page is meant for understanding the path, not performing the lesson

---

# 7. Summary Card

## Purpose
The summary card gives the learner quick, high-level roadmap context before showing structure details.

## Fields to Show

### 1. Skill Name
Examples:
- MERN Stack
- React Fundamentals
- Data Structures

### 2. Starting Level
Examples:
- Beginner
- Intermediate
- Advanced

### 3. Daily Time
Examples:
- 30 minutes
- 1 hour
- 2 hours

### 4. Total Modules
Example:
- 4 modules

### 5. Estimated Duration
Example:
- 4 weeks
- 6 weeks

## Optional Field
### Goal Reason
Optional only if layout remains clean.

Examples:
- Build projects
- Prepare for internship

### Recommendation
This field is optional and may be removed if the summary card starts feeling crowded.

## Design Rule
The summary should remain compact and readable.
It should use short label-value information rather than long explanatory text.

---

# 8. Roadmap Canvas Overview

## Purpose
The roadmap body is split into **three clear sections** so the learner can understand structure at multiple levels without being overwhelmed.

## Final Sections
1. **Modules Section**
2. **Weeks Section**
3. **Days List Section**

This creates a clean hierarchy:

```text
Module → Week → Day
```

---

# 9. Section 1 — Modules Section

## Purpose
To show all roadmap modules in one place and clearly identify the active/current module.

## Display Style
### Desktop
Compact row / responsive grid of module cards

### Mobile
Vertical compact cards or stacked responsive blocks

### Important Recommendation
Avoid horizontal scroll as the default primary pattern if vertical stacking keeps readability better.

---

## Each Module Item Should Show
- module number
- module title
- status badge

### Possible status values
- Current
- Locked
- Completed

---

## Active Module Design Rule
The active/current module must look clearly different from the others.

### Approved direction
Use a stronger visual treatment such as:
- stronger background color
- stronger border
- stronger text emphasis
- small “Current Module” badge

### Important note
The active state should be prominent, but not loud or distracting.

---

## Non-Active Modules
### Completed module
- calmer completed style
- optional completed badge

### Locked module
- more muted appearance
- no strong emphasis

---

## Interaction Rule
Only **one module** is active / selected at a time.

### User Interaction
When the learner selects another module:
- active module changes
- weeks section updates to show that module’s weeks
- days list updates according to active week inside that module

---

# 10. Section 2 — Weeks Section

## Purpose
To show the weeks that belong to the currently active module.

## Display Style
Weeks should appear as:
- compact cards
- boxes
- segmented items

### Visual requirement
One week should be active at a time.

---

## Each Week Item Should Show
- week number
- optional tiny structure summary if needed
  - e.g. 7 days

### Possible status values
- Active
- Locked
- Completed

---

## Active Week Design Rule
The active week should be visually different from other weeks.

### Approved direction
Use stronger emphasis such as:
- highlighted background
- stronger border
- bold label

---

## Week Interaction Rule
Only **one week** is active / selected at a time.

### Important refinement
Week items do not need deep expansion inside themselves.
They simply act as a selector for the Days List section below.

### Why this is better
- avoids duplicate content
- keeps page cleaner
- makes the Days section the only place where day-level detail appears

---

# 11. Section 3 — Days List Section

## Purpose
To show the days of the currently active week in a lightweight, readable way.

## Approved UI Pattern
A **readonly list** similar to task rows in a simple todo-style interface.

### Why this is the best choice
- lighter than big cards
- easier to scan
- works very well on mobile
- visually cleaner than stacking 7 bulky day cards

---

## Each Day Row Should Show
- day label
- optional short day title if available
- day type badge
- status badge

### Day Type values
- Learning
- Revision
- Exam

### Status values
- Current
- Locked
- Completed

---

## Example Day Row
```text
Day 1 — Introduction to Components — Learning — Current
Day 2 — Props Basics — Learning — Locked
Day 6 — Revision — Revision — Locked
Day 7 — Weekly Check — Exam — Locked
```

---

## Day Row Interaction Rule
Day rows must remain **readonly**.

### Not allowed
- no direct task start button in day rows
- no day click navigation to session
- no lesson preview expansion in roadmap page

### Why?
Because roadmap view should stay read-only and guided.
The learner should move into learning through the main CTA only.

---

# 12. Read-Only Interaction Model

The roadmap view should remain mostly read-only.

## Allowed Interactions
- select active module
- select active week
- click main CTA at the bottom

## Not Allowed
- task execution
- feedback request
- answer submission
- jumping directly to arbitrary day sessions
- AI actions

This keeps the purpose of the page clean and unambiguous.

---

# 13. Primary Action Button

## Final Button Text
**Get Started**

## Why “Get Started” is better than “Start Learning”
This button does not directly launch the lesson itself.
Instead, it moves the learner from roadmap orientation into the learning dashboard.

So:
- **Start Learning** sounds too immediate and session-like
- **Get Started** better fits a transition into the guided app flow

---

## Button Placement
- bottom of the roadmap page
- after the days list section
- clearly separated from roadmap content

## Button Behavior
On click:
```text
/roadmap → /learn
```

---

# 14. Mobile Design Rules

## Core Mobile Rules
- vertical stacked layout only
- summary card must stay concise
- modules section should remain readable without clutter
- weeks section should stay compact
- days section should use clean list rows
- CTA button must be full width
- no deep nested visual complexity

## Mobile Visual Order
```text
Header
→ Summary Card
→ Modules Section
→ Weeks Section
→ Days List Section
→ Get Started Button
```

---

# 15. Desktop Design Rules

## Desktop Rules
- same structure as mobile
- more spacing and breathing room
- modules can appear in row / responsive grid
- weeks can appear in row / responsive grid
- days list remains below in a clean list format
- no analytics side column
- no lesson preview area

## Important
Roadmap view should remain a roadmap view, not a dashboard.

---

# 16. States This View Must Support

## 16.1 Loading
Example message:
**Loading your roadmap...**

## 16.2 Empty
If no roadmap exists:
- message: **No roadmap available yet**
- action: **Create Roadmap**
- navigation target: `/setup`

## 16.3 Error
If roadmap fetch fails or roadmap data is invalid:
- readable error alert
- action options:
  - Retry
  - Back to Setup

## 16.4 Success
When roadmap exists and is valid:
- summary card visible
- modules visible
- weeks visible for active module
- days visible for active week
- Get Started button visible

---

# 17. What Is Intentionally Excluded

To keep the Roadmap View focused and clear, the following are intentionally excluded:

- no lesson content preview
- no task preview
- no task inputs
- no feedback section
- no AI controls
- no progress charts
- no completion action
- no regenerate roadmap button in MVP
- no edit roadmap button in MVP
- no direct session launch from day rows

---

# 18. Relationship With Other Views

## `/setup`
- user generates the roadmap

## `/roadmap`
- user sees the roadmap structure and current roadmap hierarchy

## `/learn`
- user sees current learning state and current session summary

## `/session/:dayId`
- user reads lesson, performs task, requests feedback, and completes the day

## Important Role Separation
Roadmap View never overlaps with session behavior.

---

# 19. Functional Decisions Locked in This Proposal

If this design is approved, the following decisions are considered locked:

- roadmap page is read-only
- roadmap canvas has 3 sections
- section 1 = modules
- section 2 = active module weeks
- section 3 = active week readonly days list
- only one module is active at a time
- only one week is active at a time
- day rows are non-clickable
- active module gets stronger appearance
- active week gets stronger appearance
- only one primary CTA exists
- CTA text is **Get Started**
- CTA navigates to `/learn`

---

# 20. Textual Wireframe Preview

```text
/roadmap

[ Header ]
  Your Learning Roadmap
  Here is the structured plan based on your goal and preferences.

[ Summary Card ]
  Skill: MERN Stack
  Level: Beginner
  Daily Time: 1 hour
  Modules: 4
  Duration: ~4 weeks

[ Section 1 — Modules ]
  [ Module 1 — Current ]
  [ Module 2 ]
  [ Module 3 ]
  [ Module 4 ]

[ Section 2 — Active Module Weeks ]
  [ Week 1 — Active ]
  [ Week 2 ]
  [ Week 3 ]
  [ Week 4 ]

[ Section 3 — Days ]
  • Day 1 — Learning — Current
  • Day 2 — Learning — Locked
  • Day 3 — Learning — Locked
  • Day 4 — Learning — Locked
  • Day 5 — Learning — Locked
  • Day 6 — Revision — Locked
  • Day 7 — Exam — Locked

[ Get Started ]
```

---

# 21. Final Summary

The Roadmap View is designed to be:

- read-only
- structured
- mobile-first
- visually hierarchical
- clear without being heavy
- separate from learning execution

This design keeps roadmap understanding simple and controlled while guiding the learner into the real learning flow through a single clear action.

---
