# Application Architecture
## Skill Master — Functional Structure & Screen Blueprint

**Document Type:** Product architecture / screen structure planning  
**Project:** Skill Master  
**App Type:** React Single Page Application (SPA)  
**Purpose:** Freeze the application's functional structure before development so screens, navigation, and UI behavior remain clear and consistent.

---

# 1. Product Purpose

Skill Master is a structured self-learning application designed to:

- collect learner information and preferences
- generate a personalized learning roadmap
- guide the learner through daily study flow
- keep progress visible at all times
- allow the learner to read lessons, perform tasks, and receive feedback
- support revision and exam flow without making the app confusing

This document focuses only on **application architecture based on functionality**.

It defines:

- app views / routes
- high-level user flow
- page-by-page wireframe overview
- what each page contains
- how the pages connect to each other
- which views were merged or removed for simplicity

---

# 2. Application Type

## Core Model
- Single Page Application (SPA)
- Route-based navigation using React Router
- No full page reloads
- Shared authenticated layout after login

## Architecture Principle
The application should stay:

- simple
- focused
- beginner-friendly to build
- easy to expand later

---

# 3. Final Route Map

## Public Route
```text
/auth
```

## Protected Routes
```text
/setup
/roadmap
/learn
/session/:dayId
```

## Optional Utility Route
```text
*
```
for fallback / not found

---

# 4. Final Screen Count

## Core Screens
1. **Auth View**
2. **Setup View**
3. **Roadmap View**
4. **Learn Dashboard View**
5. **Session View**

## Optional Utility Screen
6. **Not Found View**

---

# 5. Views That Were Intentionally Removed or Merged

To keep the MVP simple and clean, these views are **not separate pages**:

- no separate **Settings page**
- no separate **Profile page**
- no separate **Progress page**
- no separate **Exam page**

## Their new placement
- **Profile / settings actions** → profile dropdown in top navbar
- **Progress summary** → inside dashboard
- **Exam flow** → inside session page
- **Revision queue** → inside dashboard

This keeps the app smaller and easier to build.

---

# 6. Global User Flow

## First-Time User Flow
```text
/auth
→ /setup
→ /roadmap
→ /learn
→ /session/:dayId
→ /learn
```

## Returning User Flow
```text
/auth
→ /learn
→ /session/:dayId
→ /learn
```

## If roadmap does not exist
```text
/auth
→ /setup
```

---

# 7. Shared App Layout

## Shared Authenticated Layout
Used on:

- `/roadmap`
- `/learn`
- `/session/:dayId`

## Shared Layout Areas

### A. Top Header / Navbar
Contains:
- Skill Master logo / app name
- current skill name (if available)
- main navigation links
  - Dashboard
  - Roadmap
- profile dropdown

### B. Profile Dropdown
Contains:
- user full name
- user email
- edit learning setup
- logout

### C. Main Content Area
This is the changing view area where route-specific content appears.

## Layout Decision
- no sidebar for MVP
- top navbar is enough
- simpler for responsive layout
- easier to build for beginner team

---

# 8. Page-by-Page Wireframe Overview

---

## 8.1 Auth View
### Route
```text
/auth
```

### Purpose
- allow user login
- allow new account creation

### Layout Structure
- centered auth card
- app branding above or beside card
- login/signup tab switch

### Main Sections

#### A. Branding Area
Contains:
- logo
- project name
- short one-line subtitle

#### B. Auth Form Area
One card with two modes:
- Login
- Sign Up

### Login Form
#### Inputs
- Email
- Password

#### Actions
- Login button
- switch to Sign Up

### Sign Up Form
#### Inputs
- Full Name
- Email
- Password
- Confirm Password

#### Actions
- Create Account button
- switch to Login

### States
- idle
- validation error
- submitting
- failed login/signup
- success

### Result
After success:
- new user goes to `/setup`
- returning user goes to `/learn`

---

## 8.2 Setup View
### Route
```text
/setup
```

### Purpose
- collect learner profile information
- collect learning preferences
- collect skill goal
- prepare learner for roadmap generation

### Layout Structure
- page heading at top
- one large main form card
- multiple sections inside one page

### Main Sections

#### A. Learner Information Section
Inputs:
- Full Name *(prefilled if available)*
- Role / Identity
  - Student
  - Job Seeker
  - Other
- Current Level
  - Beginner
  - Intermediate
  - Advanced

#### B. Learning Goal Section
Inputs:
- What do you want to learn?
- Why do you want to learn it? *(optional / short answer)*

#### C. Learning Preference Section
Inputs:
- Daily available time
- Preferred pace
- Preferred learning style

### Primary Action
- Generate Roadmap

### Secondary Action
- Back

### Helper Text
A small support line can appear above the button, for example:

> Your answers will be used to generate a personalized roadmap.

### States
- idle
- validation error
- generating roadmap
- generation failed

### Result
On success → `/roadmap`

---

## 8.3 Roadmap View
### Route
```text
/roadmap
```

### Purpose
- show the generated roadmap clearly
- let the learner understand the structure before starting
- show where the journey begins

### Layout Structure
- roadmap summary card at top
- roadmap breakdown area in middle
- action area at bottom

### Main Sections

#### A. Roadmap Summary Card
Show:
- skill name
- current level
- estimated duration
- number of modules
- daily study time
- generation timestamp *(optional)*

#### B. Roadmap Structure Area
Recommended UI:
- accordion style module list

Each module shows:
- module title
- module number
- weeks inside it

Each week shows:
- week number
- days inside it

Each day shows:
- day label
- day type
  - learning
  - revision
  - exam
- state badge
  - locked
  - current
  - completed

### Important Rule
This page should **not** display full lesson content.
It should only show roadmap structure and current progress state.

#### C. Action Area
Main button:
- Start Learning

Optional buttons:
- Back to Setup
- Regenerate Roadmap *(optional, not necessary for first MVP)*

### States
- loading roadmap
- roadmap found
- no roadmap
- invalid roadmap

### Result
- Start Learning → `/learn`

---

## 8.4 Learn Dashboard View
### Route
```text
/learn
```

### Purpose
- act as the main home screen after roadmap generation
- show current learning position
- show today’s task summary
- show progress and revision information

### Layout Structure
- summary cards on top
- main Today’s Task card in center
- supporting sections below

### Main Sections

#### A. Progress Summary Row
Recommended cards:
1. Current Module
2. Current Week
3. Current Day
4. Revision Queue Count

Optional extra cards:
- latest exam score
- completed tasks count

#### B. Today’s Task Main Card
Show:
- lesson title
- day type
- short summary / intro
- estimated time
- task status
  - pending
  - in progress
  - completed

Main button:
- Start Today’s Task
or
- Continue Learning

#### C. Revision Queue Section
Show:
- topics added for revision
- topic count
- optional priority tag

Possible actions:
- review later
- open session
- remove topic *(optional)*

#### D. Recent Progress Section
Show:
- last completed task
- latest exam score
- weak topics found
- recent activity list

#### E. Empty State
If no roadmap exists:
- message: No roadmap available yet
- button: Create Roadmap

### States
- loading dashboard
- no roadmap
- active learning in progress
- day completed
- revision pending

### Result
- Continue Learning → `/session/:dayId`
- Roadmap nav → `/roadmap`

---

## 8.5 Session View
### Route
```text
/session/:dayId
```

### Purpose
- show full lesson content
- let learner perform exercises
- allow submission
- allow optional feedback
- allow completion of the current day
- render exam mode when needed

### Layout Structure
- session header
- lesson container
- exercise area
- feedback area
- completion area

### Main Sections

#### A. Session Header
Show:
- module info
- week info
- day label
- lesson title
- day type badge
  - learning
  - revision
  - exam

Actions:
- Back to Dashboard
- Open Roadmap

#### B. Lesson Content Container
This is the main reading area.

Can contain:
- lesson introduction
- explanation blocks
- examples
- bullet notes
- key takeaway box

#### C. Exercise / Task Area
This area changes depending on the task type.

Possible inputs:
- textarea
- short text input
- MCQ options
- checklist

#### D. Action Area
Buttons:
- Get Feedback
- Add to Revision Queue
- Mark as Complete / Submit Final

### Recommended User Action Order
1. read lesson
2. attempt task
3. request feedback if needed
4. improve answer
5. submit final / mark complete

#### E. Feedback Area
Show:
- feedback card
- strengths
- improvements
- optional suggestion to add topic to revision queue

#### F. Completion Area
Main action:
- Mark as Complete

### Result
- after completion → return to `/learn`

---

## 8.6 Session View in Exam Mode
### Route
Same route:
```text
/session/:dayId
```

### Condition
When current day type is `exam`

### UI Difference
The normal lesson/task layout switches into exam mode.

### Exam Mode Sections
- exam title
- short instructions
- MCQ question list
- submit exam button

### After Exam Submission
Show:
- score
- pass/fail result
- next state message

Possible outcomes:
- passed → move forward
- failed → return learner to revision stage

### Important Decision
A separate exam page is **not needed**.
Keeping exam inside session view reduces route complexity.

---

## 8.7 Not Found View (Optional)
### Route
```text
*
```

### Purpose
- fallback when route is invalid

### UI
- simple message: Page not found
- button: Go to Dashboard

---

# 9. Reusable Component Inventory

## Core Components
- `Button`
- `Input`
- `Select`
- `Textarea`
- `Card`
- `Badge`
- `Navbar`
- `DropdownMenu`
- `StatCard`
- `TaskCard`
- `LessonContent`
- `FeedbackCard`
- `AccordionModule`
- `DayItem`
- `RevisionQueueItem`
- `Loader`
- `EmptyState`
- `ErrorAlert`

## Page-Level Components

### Auth View
- `AuthTabs`
- `LoginForm`
- `SignupForm`

### Setup View
- `LearnerInfoSection`
- `GoalSection`
- `PreferenceSection`

### Roadmap View
- `RoadmapSummary`
- `ModuleAccordion`
- `WeekBlock`
- `DayStatusChip`

### Learn Dashboard View
- `ProgressSummaryRow`
- `TodayTaskCard`
- `RevisionQueuePanel`
- `RecentProgressPanel`

### Session View
- `SessionHeader`
- `ExerciseForm`
- `FeedbackPanel`
- `ExamQuestionCard`

---

# 10. Application Behavior Decisions

## Confirmed MVP Decisions
- only 5 main screens
- top navbar after login
- no sidebar for MVP
- no separate settings page
- no separate profile page
- no separate progress page
- no separate exam page
- profile actions inside dropdown
- progress summary inside dashboard
- exam inside session page
- roadmap shown separately before learning starts

---

# 11. Page Connection Logic

## Auth View
- login success + no setup → `/setup`
- login success + setup complete → `/learn`

## Setup View
- generate roadmap success → `/roadmap`

## Roadmap View
- start learning → `/learn`

## Learn Dashboard View
- continue learning → `/session/:dayId`
- roadmap button → `/roadmap`

## Session View
- complete task → `/learn`
- exam result processed → `/learn`
- invalid session → `/learn`

---

# 12. UI State Requirements

Each page must support the necessary UI states.

## Auth View
- idle
- validation error
- submitting
- success
- failure

## Setup View
- idle
- validation error
- generating
- success
- error

## Roadmap View
- loading
- roadmap found
- no roadmap
- invalid roadmap

## Learn Dashboard View
- loading
- no roadmap
- active learning
- day completed
- revision pending

## Session View
- loading session
- lesson mode
- revision mode
- exam mode
- feedback loading
- feedback shown
- submission success
- submission error

---

# 13. Why This Architecture Is Good for the MVP

This architecture is intentionally designed to be:

- easier to understand before coding
- easier to build in React
- easier to test screen by screen
- easier to maintain without confusion
- easier to extend later without restructuring the whole app

It avoids unnecessary complexity by merging small or weak screens into stronger main screens.

---

# 14. Final Summary

Skill Master’s application architecture is based on **5 main functional views**:

1. **Auth**
2. **Setup**
3. **Roadmap**
4. **Learn Dashboard**
5. **Session**

Everything else has been merged into these views to keep the MVP focused and buildable.

This structure ensures:

- clear user flow
- fewer routes
- less UI confusion
- simpler frontend development
- stronger alignment before coding starts

---
