this is my high level design of application i have decided not yet final but at least have a sketch of what i am going for .....
[# Application Architecture
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
# Page-Wise API Communication
## Skill Master — Frontend ↔ Backend Interaction Specification


**Document Type:** Page-wise communication contract  
**Project:** Skill Master  
**Purpose:** Define, in a clean and professional way, how each frontend page communicates with the backend so implementation remains clear, predictable, and stable.


---


# 1. Document Scope


This document defines the interaction between frontend and backend for each page of the application.


For every page, the following are specified:


1. **Page Name**
2. **Page Purpose**
3. **User Actions**
4. **Backend Request Triggered**
5. **Expected Success Response**
6. **Expected Error Response**
7. **Frontend Behavior After Response**


This document is intended to:


- prevent confusion during implementation
- ensure frontend and backend stay aligned
- reduce risk of UI collapse due to unclear response shapes
- provide a stable reference before detailed screen design and coding


---


# 2. Global Response Convention


To keep the application consistent, all backend responses should follow a predictable structure.


## Standard Success Shape
```json
{
  "success": true,
  "message": "Short readable message",
  "data": {}
}
```


## Standard Error Shape
```json
{
  "success": false,
  "message": "Readable error message",
  "errors": {}
}
```


## Notes
- `success` must always exist
- `message` should always be readable and simple
- `data` should contain only the data needed by the page
- `errors` is optional and should only be used when field-specific issues exist


---


# 3. Page-Wise Interaction Design


---


# 3.1 AUTH VIEW
## Route
```text
/auth
```


## Page Purpose
The Auth View handles both:
- user registration
- user login


It is the public entry point of the application.


---


## User Action 1 — Create Account


### Action Description
The user fills the sign up form and clicks **Create Account**.


### Frontend Inputs
```json
{
  "fullName": "Sharjeel Arshad",
  "email": "sharjeel@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123"
}
```


### Backend Request Triggered
```http
POST /api/auth/register
```


### Expected Success Response
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "fullName": "Sharjeel Arshad",
      "email": "sharjeel@example.com"
    },
    "token": "jwt_token_here",
    "setupCompleted": false
  }
}
```


### Expected Error Response
#### Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "fullName": "Full name is required",
    "email": "Valid email is required",
    "password": "Password must be at least 8 characters"
  }
}
```


#### Duplicate Email Error
```json
{
  "success": false,
  "message": "This email is already registered"
}
```


### Frontend Behavior After Response
#### On Success
- stop loading state
- save token in local storage or auth state
- save basic user info in auth state
- redirect user to `/setup`


#### On Error
- stop loading state
- show readable message near form top
- if `errors` object exists, show field-specific errors under inputs
- keep already typed form values intact


---


## User Action 2 — Login


### Action Description
The user fills the login form and clicks **Login**.


### Frontend Inputs
```json
{
  "email": "sharjeel@example.com",
  "password": "securePassword123"
}
```


### Backend Request Triggered
```http
POST /api/auth/login
```


### Expected Success Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "user_id",
      "fullName": "Sharjeel Arshad",
      "email": "sharjeel@example.com"
    },
    "token": "jwt_token_here",
    "setupCompleted": true
  }
}
```


### Expected Error Response
#### Invalid Credentials
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```


#### Missing Fields
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "Email is required",
    "password": "Password is required"
  }
}
```


### Frontend Behavior After Response
#### On Success
- stop loading state
- save token and user info
- check `setupCompleted`
- if `setupCompleted` is `false`, navigate to `/setup`
- if `setupCompleted` is `true`, navigate to `/learn`


#### On Error
- stop loading state
- show general error alert above form
- preserve entered email
- clear password only if desired by UI decision


---


## User Action 3 — Restore Existing Session


### Action Description
When the app loads after refresh, frontend may verify current logged-in user.


### Backend Request Triggered
```http
GET /api/auth/me
Authorization: Bearer <token>
```


### Expected Success Response
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "fullName": "Sharjeel Arshad",
    "email": "sharjeel@example.com",
    "setupCompleted": true
  }
}
```


### Expected Error Response
```json
{
  "success": false,
  "message": "Unauthorized"
}
```


### Frontend Behavior After Response
#### On Success
- restore authenticated session
- set user state
- continue normal app flow


#### On Error
- clear invalid token
- return user to `/auth`


---


# 3.2 SETUP VIEW
## Route
```text
/setup
```


## Page Purpose
The Setup View collects learner profile data and learning preferences before roadmap generation.


---


## User Action 1 — Save Setup Information


### Action Description
The user fills the setup form and clicks **Generate Roadmap**.


### Frontend Inputs
```json
{
  "role": "Student",
  "currentLevel": "Beginner",
  "skillGoal": "Learn MERN stack to build web applications",
  "goalReason": "I want to build real projects",
  "dailyTime": "1 hour",
  "pace": "Normal",
  "learningStyle": "Mixed"
}
```


### Backend Request Triggered
This action can be handled in one of two ways:


#### Recommended MVP Approach
A single request both saves setup data and starts roadmap generation.


```http
POST /api/roadmap/generate
Authorization: Bearer <token>
```


### Expected Success Response
```json
{
  "success": true,
  "message": "Roadmap generated successfully",
  "data": {
    "setupCompleted": true,
    "roadmapId": "roadmap_id",
    "skillName": "MERN Stack Development",
    "modulesCount": 4,
    "estimatedDuration": "4 weeks"
  }
}
```


### Expected Error Response
#### Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "skillGoal": "Skill goal is required",
    "currentLevel": "Current level is required",
    "dailyTime": "Daily study time is required"
  }
}
```


#### AI Generation Failure
```json
{
  "success": false,
  "message": "Roadmap generation failed. Please try again."
}
```


#### Unauthorized Error
```json
{
  "success": false,
  "message": "Unauthorized"
}
```


### Frontend Behavior After Response
#### On Success
- stop loading state
- optionally show a short success message
- navigate user to `/roadmap`
- if response contains overview data, use it for first roadmap summary render


#### On Error
- stop loading state
- show message at top of form
- if field errors exist, display them under related fields
- preserve all entered values
- do not navigate away from setup page


---


## User Action 2 — Revisit Setup for Editing


### Action Description
The user opens setup again from profile dropdown to update learning preferences.


### Backend Request Triggered
```http
GET /api/setup/current
Authorization: Bearer <token>
```


### Expected Success Response
```json
{
  "success": true,
  "data": {
    "role": "Student",
    "currentLevel": "Beginner",
    "skillGoal": "Learn MERN stack to build web applications",
    "goalReason": "I want to build real projects",
    "dailyTime": "1 hour",
    "pace": "Normal",
    "learningStyle": "Mixed"
  }
}
```


### Expected Error Response
```json
{
  "success": false,
  "message": "No setup data found"
}
```


### Frontend Behavior After Response
#### On Success
- prefill form with saved values
- allow user to edit


#### On Error
- open empty setup form
- show non-blocking message if needed


---


# 3.3 ROADMAP VIEW
## Route
```text
/roadmap
```


## Page Purpose
The Roadmap View displays the generated roadmap structure before the learner starts the daily learning flow.


---


## User Action 1 — Load Current Roadmap


### Action Description
When the page opens, frontend fetches the current roadmap.


### Backend Request Triggered
```http
GET /api/roadmap/current
Authorization: Bearer <token>
```


### Expected Success Response
```json
{
  "success": true,
  "message": "Roadmap fetched successfully",
  "data": {
    "_id": "roadmap_id",
    "skillName": "MERN Stack Development",
    "estimatedDuration": "4 weeks",
    "modulesCount": 4,
    "roadmapJson": {
      "skillName": "MERN Stack Development",
      "modules": [
        {
          "moduleNumber": 1,
          "title": "React Fundamentals",
          "weeks": [
            {
              "weekNumber": 1,
              "days": [
                {
                  "dayId": "m1w1d1",
                  "dayLabel": "Monday",
                  "type": "learning"
                },
                {
                  "dayId": "m1w1d6",
                  "dayLabel": "Saturday",
                  "type": "revision"
                },
                {
                  "dayId": "m1w1d7",
                  "dayLabel": "Sunday",
                  "type": "exam"
                }
              ]
            }
          ]
        }
      ]
    },
    "createdAt": "2026-02-22T10:10:00Z"
  }
}
```


### Expected Error Response
#### No Roadmap Found
```json
{
  "success": false,
  "message": "No roadmap found for this user"
}
```


#### Invalid / Broken Roadmap
```json
{
  "success": false,
  "message": "Roadmap data is invalid"
}
```


### Frontend Behavior After Response
#### On Success
- stop loading state
- render roadmap summary card
- render roadmap accordion/module structure
- mark only overview states, not full lesson content


#### On Error
- stop loading state
- show empty/error state
- offer button to go back to `/setup`


---


## User Action 2 — Start Learning


### Action Description
The user clicks **Start Learning** after reviewing the roadmap.


### Backend Request Triggered
No backend call is required if the roadmap is already loaded and progress exists.


#### Optional Safety Check (recommended)
```http
GET /api/progress/current
Authorization: Bearer <token>
```


### Expected Success Response
```json
{
  "success": true,
  "data": {
    "currentModule": 1,
    "currentWeek": 1,
    "currentDay": "Monday",
    "currentDayId": "m1w1d1"
  }
}
```


### Expected Error Response
```json
{
  "success": false,
  "message": "Progress state not found"
}
```


### Frontend Behavior After Response
#### On Success
- navigate to `/learn`


#### On Error
- show readable message
- if roadmap exists but progress missing, frontend may still navigate to `/learn` and let dashboard handle empty state


---


# 3.4 LEARN DASHBOARD VIEW
## Route
```text
/learn
```


## Page Purpose
The Learn Dashboard works as the learner’s main home screen after setup and roadmap creation.


It shows:
- current learning position
- today’s task summary
- revision queue
- recent progress


---


## User Action 1 — Load Dashboard Data


### Action Description
When the Learn Dashboard opens, frontend requests current progress and high-level learning state.


### Backend Request Triggered
```http
GET /api/progress/current
Authorization: Bearer <token>
```


### Expected Success Response
```json
{
  "success": true,
  "message": "Progress fetched successfully",
  "data": {
    "currentModule": 1,
    "currentWeek": 1,
    "currentDay": "Monday",
    "currentDayId": "m1w1d1",
    "currentLessonTitle": "Introduction to React Components",
    "currentDayType": "learning",
    "estimatedTime": "45 minutes",
    "taskStatus": "pending",
    "revisionQueue": [
      {
        "topicId": "rev1",
        "title": "Props vs State",
        "sourceDayId": "m1w1d2"
      }
    ],
    "latestExamScore": {
      "weekNumber": 1,
      "score": 70,
      "passed": false
    },
    "recentActivity": [
      {
        "type": "task-completed",
        "title": "Completed React JSX basics"
      }
    ]
  }
}
```


### Expected Error Response
#### No Progress Found
```json
{
  "success": false,
  "message": "No progress found"
}
```


#### No Roadmap Exists
```json
{
  "success": false,
  "message": "No roadmap available"
}
```


### Frontend Behavior After Response
#### On Success
- stop loading state
- populate summary cards
- populate today’s task card
- populate revision queue and recent activity


#### On Error
- stop loading state
- if no roadmap exists, show empty state with action to create roadmap
- if progress missing, show fallback message and allow reload or setup revisit


---


## User Action 2 — Continue Learning


### Action Description
The user clicks **Start Today’s Task** or **Continue Learning**.


### Backend Request Triggered
No extra backend request is required if `currentDayId` is already available from dashboard data.


### Frontend Behavior After Response
- navigate to `/session/:dayId`
using `currentDayId`


---


## User Action 3 — Open Roadmap


### Action Description
The user clicks the roadmap navigation option from dashboard.


### Backend Request Triggered
No immediate request required if roadmap view will fetch its own data.


### Frontend Behavior After Response
- navigate to `/roadmap`


---


# 3.5 SESSION VIEW
## Route
```text
/session/:dayId
```


## Page Purpose
The Session View is the main learning workspace.


It handles:
- lesson content rendering
- exercise/task display
- answer submission
- feedback request
- revision queue actions
- task completion
- exam mode


---


## User Action 1 — Load Session Data


### Action Description
When the session page opens, frontend requests all data needed for the current day.


### Backend Request Triggered
```http
GET /api/session/:dayId
Authorization: Bearer <token>
```


### Expected Success Response (Learning / Revision Day)
```json
{
  "success": true,
  "message": "Session loaded successfully",
  "data": {
    "dayId": "m1w1d1",
    "moduleNumber": 1,
    "moduleTitle": "React Fundamentals",
    "weekNumber": 1,
    "dayLabel": "Monday",
    "type": "learning",
    "lessonTitle": "Introduction to Components",
    "lessonContent": "Detailed lesson content here...",
    "task": {
      "taskType": "text",
      "prompt": "Explain what a React component is in your own words"
    }
  }
}
```


### Expected Success Response (Exam Day)
```json
{
  "success": true,
  "message": "Exam session loaded successfully",
  "data": {
    "dayId": "m1w1d7",
    "moduleNumber": 1,
    "moduleTitle": "React Fundamentals",
    "weekNumber": 1,
    "dayLabel": "Sunday",
    "type": "exam",
    "exam": {
      "questions": [
        {
          "questionId": "q1",
          "question": "What is JSX?",
          "options": [
            "A database",
            "A syntax extension for JavaScript",
            "A backend framework",
            "A CSS library"
          ]
        }
      ],
      "passingScore": 80
    }
  }
}
```


### Expected Error Response
#### Invalid Session
```json
{
  "success": false,
  "message": "Session not found"
}
```


#### Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized"
}
```


### Frontend Behavior After Response
#### On Success
- stop loading state
- if `type` is `learning` or `revision`, render lesson + task layout
- if `type` is `exam`, render exam layout


#### On Error
- stop loading state
- show readable error state
- provide action to return to `/learn`


---


## User Action 2 — Request Feedback


### Action Description
The learner writes an answer and clicks **Get Feedback**.


### Frontend Inputs
```json
{
  "dayId": "m1w1d1",
  "prompt": "Explain what a React component is in your own words",
  "userAnswer": "A component is a reusable UI block in React"
}
```


### Backend Request Triggered
```http
POST /api/feedback
Authorization: Bearer <token>
```


### Expected Success Response
```json
{
  "success": true,
  "message": "Feedback generated successfully",
  "data": {
    "feedback": {
      "strengths": [
        "You correctly described the reusable nature of components"
      ],
      "improvements": [
        "Mention that components return JSX and can receive props"
      ],
      "summary": "Good answer, but add more detail about how components work."
    }
  }
}
```


### Expected Error Response
#### Empty Answer Error
```json
{
  "success": false,
  "message": "Answer is required before feedback can be generated"
}
```


#### AI Failure
```json
{
  "success": false,
  "message": "Feedback generation failed. Please try again."
}
```


### Frontend Behavior After Response
#### On Success
- stop feedback loading state
- render feedback section below the task area
- preserve the learner’s entered answer


#### On Error
- stop feedback loading state
- show readable message near feedback area
- do not clear learner answer


---


## User Action 3 — Add Topic to Revision Queue


### Action Description
The learner clicks **Add to Revision Queue** for a difficult concept.


### Frontend Inputs
```json
{
  "title": "React props",
  "sourceDayId": "m1w1d2"
}
```


### Backend Request Triggered
```http
POST /api/progress/revision-queue/add
Authorization: Bearer <token>
```


### Expected Success Response
```json
{
  "success": true,
  "message": "Topic added to revision queue",
  "data": {
    "revisionQueueCount": 2
  }
}
```


### Expected Error Response
#### Duplicate Topic
```json
{
  "success": false,
  "message": "Topic already exists in revision queue"
}
```


### Frontend Behavior After Response
#### On Success
- show short success message or toast
- update revision queue count locally if visible


#### On Error
- show readable non-blocking message
- do not break session view


---


## User Action 4 — Mark Learning Task as Complete


### Action Description
The learner finishes the task and clicks **Mark as Complete**.


### Frontend Inputs
```json
{
  "dayId": "m1w1d1",
  "status": "completed"
}
```


### Backend Request Triggered
```http
POST /api/progress/complete
Authorization: Bearer <token>
```


### Expected Success Response
```json
{
  "success": true,
  "message": "Task marked as complete",
  "data": {
    "currentModule": 1,
    "currentWeek": 1,
    "currentDay": "Tuesday",
    "nextDayId": "m1w1d2"
  }
}
```


### Expected Error Response
#### Already Completed
```json
{
  "success": false,
  "message": "This task has already been completed"
}
```


#### Progress Update Failure
```json
{
  "success": false,
  "message": "Could not update progress"
}
```


### Frontend Behavior After Response
#### On Success
- stop loading state
- optionally show completion confirmation
- redirect back to `/learn`
- dashboard will now show updated current day


#### On Error
- stop loading state
- show readable message near completion button
- do not redirect


---


## User Action 5 — Submit Exam


### Action Description
The learner selects exam answers and clicks **Submit Exam**.


### Frontend Inputs
```json
{
  "dayId": "m1w1d7",
  "answers": [
    {
      "questionId": "q1",
      "selectedIndex": 1
    }
  ]
}
```


### Backend Request Triggered
```http
POST /api/exam/submit
Authorization: Bearer <token>
```


### Expected Success Response (Pass)
```json
{
  "success": true,
  "message": "Exam submitted successfully",
  "data": {
    "score": 85,
    "passed": true,
    "nextState": {
      "currentModule": 1,
      "currentWeek": 2,
      "currentDay": "Monday",
      "nextDayId": "m1w2d1"
    },
    "weakTopics": []
  }
}
```


### Expected Success Response (Fail)
```json
{
  "success": true,
  "message": "Exam submitted successfully",
  "data": {
    "score": 65,
    "passed": false,
    "nextState": {
      "currentModule": 1,
      "currentWeek": 1,
      "currentDay": "Saturday",
      "nextDayId": "m1w1d6"
    },
    "weakTopics": [
      "JSX",
      "Component structure"
    ]
  }
}
```


### Expected Error Response
#### Invalid Submission
```json
{
  "success": false,
  "message": "Exam answers are incomplete"
}
```


#### Submission Failure
```json
{
  "success": false,
  "message": "Exam submission failed"
}
```


### Frontend Behavior After Response
#### On Success
- stop loading state
- show result summary inside the session page
- show score and pass/fail message
- after acknowledgement, redirect to `/learn`


#### On Fail Result
- still treated as successful submission
- show score and weak topics
- explain that learner returns to revision stage
- redirect back to `/learn`


#### On Error
- stop loading state
- keep selected answers intact if possible
- show readable submission error


---


# 4. Frontend Stability Rules


To avoid frontend collapse, the following rules should be respected in implementation.


## Rule 1 — Never trust response shape blindly
Frontend should always first check:
```json
{
  "success": true
}
```


## Rule 2 — Render only if required data exists
Examples:
- roadmap view should not render modules unless `roadmapJson.modules` exists
- session view should not render task unless `task` exists
- exam mode should not render questions unless `exam.questions` exists


## Rule 3 — Every async page needs four safe states
Each page must handle:
- loading
- success
- empty
- error


## Rule 4 — Preserve user input on recoverable errors
Examples:
- setup form values should stay after generation failure
- session answer should stay after feedback failure
- exam answers should stay after submission failure if possible


## Rule 5 — Frontend should not depend on AI directly
Frontend only receives backend-cleaned results.
The backend must validate AI output before saving or returning it.


---


# 5. Final Summary


This document defines Skill Master’s communication contract **page by page**.


It ensures that before detailed UI design and coding:


- every important user action is known
- every backend request is defined
- every success response is predictable
- every error response is expected
- every frontend reaction is planned


This creates a stable foundation for both:
- backend implementation
- frontend screen design


---
]
and after it i also have decided detailed ui views of all public and protected routes 
below are some examples 
auth view design :[# Public View Design
## Skill Master — Public Auth View Specification


**Document Type:** View design specification  
**Project:** Skill Master  
**View Name:** Public Auth View  
**Route:** `/auth`  
**Design Status:** Approved direction — Option B refined  
**Purpose:** Define the first visible screen of the web application in a way that is simple, self-explanatory, mobile-first, and easy to implement.


---


# 1. View Identity


## View Name
**Public Auth View**


## Route
```text
/auth
```


## Core Purpose
This view is the first visible screen of the application and must perform two jobs together:


- introduce the product clearly
- allow the user to login or create an account


This view is not a separate marketing landing page.
It is the practical public entry screen of the application.


---


# 2. Design Philosophy


The Public Auth View should feel:


- simple
- trustworthy
- clean
- self-explanatory
- mobile-friendly
- beginner-friendly to build


It should avoid:


- clutter
- over-designed animations
- unnecessary marketing elements
- extra actions that distract from authentication


## Main UX Goal
When a user opens this screen, the user should quickly understand:


> This is a learning application that creates a personalized roadmap and guides daily progress.


And at the same time, the user should immediately see:


> I need to login or create an account here.


---


# 3. Final Layout Direction


## Approved Direction
**Option B refined**


### Structure
The view will have:


1. a **top branding area**
2. a **main centered auth container**


Inside the main auth container, there will be **two sections**:


- **Product Intro Panel**
- **Auth Form Panel**


---


# 4. Responsive Layout Behavior


## 4.1 Mobile-First Layout
This view must be designed mobile-first.


### Mobile order
```text
Top Branding Area
→ Main Container
   → Auth Form Panel
   → Product Intro Panel
```


### Why this order?
On mobile, the user should see the form first.
This prevents confusion and makes the primary action immediately visible.


The user should not need to scroll through product details before understanding where to start.


---


## 4.2 Desktop Layout
On desktop, the same content will adapt into a two-section horizontal layout.


### Desktop order
```text
Top Branding Area
→ Main Container
   → Product Intro Panel (left)
   → Auth Form Panel (right)
```


### Why this works?
- desktop space is used better
- the screen feels balanced
- product clarity remains visible
- authentication remains the strongest interactive element


---


# 5. Top Branding Area


## Purpose
To establish app identity before the user interacts with the form.


## Content
### App Name
**Skill Master**


### Slogan / Subtitle
**Personalized learning with daily guided progress**


## Notes
- this section remains simple
- no navigation links here
- no extra buttons here
- no large hero illustration here


## Placement
- top of screen
- centered or slightly left aligned depending on final layout decision
- always visible before the main auth container


---


# 6. Main Auth Container


## Purpose
The main auth container combines:


- product explanation
- login / signup interaction


It should be the main visual focus of the public view.


## Structure Inside Container
```text
[ Product Intro Panel ] [ Auth Form Panel ]   ← desktop
[ Auth Form Panel ]
[ Product Intro Panel ]                        ← mobile
```


## Layout Rules
- centered on screen
- clean border or card-style container
- enough spacing between both sections
- should not feel crowded


---


# 7. Product Intro Panel


## Purpose
To explain the product in a short, useful, readable format.


This panel should help the user understand the app without turning the page into a long landing screen.


## Content Structure
### Intro Heading
**Learn with a roadmap you can actually follow**


### Short Description
**Skill Master creates a personalized roadmap from your goal and guides you through focused daily learning sessions.**


### Benefit Points
- Personalized roadmap from your goal
- Guided daily learning sessions
- Progress tracked across your journey


## Notes
- the benefit points must remain short
- no long paragraphs
- no more than 3 key points
- this panel should support the form, not compete with it


## Desktop Placement
- left side of main auth container


## Mobile Placement
- below the form panel


---


# 8. Auth Form Panel


## Purpose
To handle both login and signup actions in the same structured area.


## Interaction Pattern
The form panel will contain a **tab switch** with two modes:


- Login
- Sign Up


## Why tabs?
- simpler than separate pages
- keeps context in one place
- easier to manage for MVP
- better for a compact user flow


## Allowed Transition Behavior
- tab switching may use a subtle fade or slide-in effect
- full panel swapping animation is not required
- no heavy moving container effect in MVP


---


# 9. Auth Form Panel — Header Content


## Login Mode
### Title
**Welcome Back**


### Helper Text
**Continue your learning journey**


---


## Sign Up Mode
### Title
**Create Your Account**


### Helper Text
**Start your personalized learning path**


---


# 10. Tab Switch Design


## Tabs
- Login
- Sign Up


## Behavior Rules
- Login tab is the default active tab
- switching tabs should not reload the page
- switching tabs may clear previous error messages
- switching tabs may preserve or reset inputs depending on implementation choice
- active tab should be visually obvious


---


# 11. Login Mode Specification


## Inputs
### 1. Email
- type: email
- placeholder: `Enter your email`


### 2. Password
- type: password
- placeholder: `Enter your password`


## Main Button
- **Login**


## Secondary Text Action
- `Don’t have an account? Sign Up`


## Validation Rules
- email is required
- password is required


## Notes
- forgot password is not included in MVP
- social login is not included in MVP


---


# 12. Sign Up Mode Specification


## Inputs
### 1. Full Name
- type: text
- placeholder: `Enter your full name`


### 2. Email
- type: email
- placeholder: `Enter your email`


### 3. Password
- type: password
- placeholder: `Create a password`


### 4. Confirm Password
- type: password
- placeholder: `Confirm your password`


## Main Button
- **Create Account**


## Secondary Text Action
- `Already have an account? Login`


## Validation Rules
- full name is required
- email is required
- password is required
- confirm password is required
- password and confirm password must match


## Notes
- username field is intentionally not included
- full name and email are enough for MVP


---


# 13. Exact Control Count


## Login Tab
### Inputs
- 2 inputs


### Main actions
- 1 primary button
- 1 text switch action


---


## Sign Up Tab
### Inputs
- 4 inputs


### Main actions
- 1 primary button
- 1 text switch action


---


# 14. View States


This page must support the following states.


## General States
- idle
- validation error
- submitting
- success
- failure


## Login State Examples
- invalid email or password
- submitting login request
- login success


## Sign Up State Examples
- validation failed
- email already exists
- account created successfully


## Loading Behavior
When submitting:
- primary button becomes disabled
- button text may change
  - `Logging in...`
  - `Creating account...`


---


# 15. Mobile Design Rules


## Core Rule
The form must appear before the product details on mobile.


## Additional Mobile Rules
- full width inputs
- full width primary button
- large tap-friendly controls
- enough spacing between inputs
- text should remain short and readable
- tabs should be easy to tap
- product details should stay below form, not above it


## Important UX Reason
The mobile user should immediately understand:


> this is the place where I need to login or create an account


---


# 16. Desktop Design Rules


## Layout
Two-section horizontal main container


### Left section
Product Intro Panel


### Right section
Auth Form Panel


## Rules
- both sections should feel visually balanced
- auth form should remain the stronger interactive focus
- intro panel should support clarity, not dominate the view


---


# 17. What Is Intentionally Excluded


To keep the Public Auth View focused and buildable, these elements are not included:


- no separate landing page
- no forgot password flow
- no social login
- no username field
- no pricing blocks
- no testimonials
- no feature carousel
- no large screenshots
- no About / Contact / Features navbar
- no full sliding dual-panel animation system


---


# 18. Final Functional Decisions for Public View


## Confirmed Decisions
- public route remains only `/auth`
- top branding area stays separate
- main auth container has two sections
- desktop: intro left, form right
- mobile: form first, intro second
- login is default active tab
- no separate landing page
- no forgot password
- no username field
- no social login
- no heavy animation system
- subtle tab transition is acceptable


---


# 19. Textual Wireframe Preview


```text
/auth


[ Top Branding Area ]
  Skill Master
  Personalized learning with daily guided progress


[ Main Auth Container ]


  Desktop:
  | Product Intro Panel | Auth Form Panel |


  Mobile:
  [ Auth Form Panel ]
  [ Product Intro Panel ]


Product Intro Panel:
  Learn with a roadmap you can actually follow
  Skill Master creates a personalized roadmap from your goal and guides you through focused daily learning sessions.
  • Personalized roadmap from your goal
  • Guided daily learning sessions
  • Progress tracked across your journey


Auth Form Panel:
  [ Login | Sign Up ]


  Login Mode:
    Welcome Back
    Continue your learning journey
    Email
    Password
    [ Login ]
    Don’t have an account? Sign Up


  Sign Up Mode:
    Create Your Account
    Start your personalized learning path
    Full Name
    Email
    Password
    Confirm Password
    [ Create Account ]
    Already have an account? Login
```


---


# 20. Final Summary


The Public Auth View is designed to be:


- the first meaningful screen of the app
- a combined intro + authentication screen
- mobile-first and action-first
- simple to understand
- simple to build
- clear enough that the user is not confused on first sight


This design avoids unnecessary complexity while still giving the application a professional and structured first impression.


---]
setup view design :[# Setup View Design
## Skill Master — Setup / Onboarding View Specification


**Document Type:** View design specification  
**Project:** Skill Master  
**View Name:** Setup View  
**Route:** `/setup`  
**Design Status:** Approved direction — conversational, goal-first setup flow  
**Purpose:** Define the setup/onboarding screen in a way that is simple, self-explanatory, mobile-first, and focused on collecting only the information required to generate a personalized roadmap.


---


# 1. View Identity


## View Name
**Setup View**


## Route
```text
/setup
```


## Core Purpose
This view exists to:


- collect the learner’s main learning goal
- understand the learner’s current context
- collect the learner’s learning preferences
- prepare the data needed to generate a structured roadmap


This view should make the user feel that the application is understanding the learner before building the roadmap.


---


# 2. Design Philosophy


The Setup View should feel:


- focused
- simple
- conversational
- guided
- mobile-friendly
- easy to complete without confusion


It should avoid:


- long survey-like forms
- unnecessary bio-data collection
- too many sections
- visual clutter
- multi-step complexity for the MVP


## Main UX Goal
When the user opens this screen, the user should quickly understand:


> I am about to tell the app what I want to learn, who I am as a learner, and how I want to study.


And just before submission, the user should understand:


> These answers will be used to generate a roadmap and daily learning flow.


---


# 3. Final Layout Direction


## Approved Direction
A **single-page, goal-first setup form** with a conversational tone.


### Structure
The view will have:


1. a **header with a conversational subtitle**
2. a **main setup container / form card**
3. a **final guidance block placed near submission**
4. a **single primary call-to-action button**


---


# 4. Responsive Layout Behavior


## 4.1 Mobile-First Layout
This view must be designed mobile-first.


### Mobile order
```text
Header
→ Goal Definition Section
→ About Yourself Section
→ Your Preferences Section
→ Final Guidance
→ Generate Roadmap Button
```


### Why this order?
The user’s goal is the most important input for roadmap generation, so it should appear first and be visually dominant.


This also keeps the flow natural on mobile:
- first, the user says what they want
- then, the app asks about the learner
- then, the app asks about study preferences
- finally, the app explains why the data is being used and asks for submission


---


## 4.2 Desktop Layout
On desktop, the same content remains in the same order, but with improved spacing and width.


### Desktop structure
```text
Header
→ Main Setup Container
   → Goal Definition Section
   → About Yourself Section
   → Your Preferences Section
   → Final Guidance
   → Generate Roadmap Button
```


### Important Layout Rule
Even on desktop, this view should remain a **single focused form experience**.


There should be:
- no side panel
- no two-column split
- no parallel section layout


The entire screen should feel task-focused.


---


# 5. Header Design


## Purpose
To welcome the learner and introduce the setup flow in a human, natural tone.


## Main Title
**Let’s build your learning plan**


## Supporting Subtitle
The subtitle should address the learner by name and feel conversational.


### Approved direction
**Sharjeel, tell us what you want to learn and we’ll turn it into a structured roadmap.**


## Why this works
- the page feels human and personalized
- the user understands that roadmap generation starts here
- the tone feels supportive rather than robotic


---


# 6. Top Instruction Block Decision


## Final Decision
A separate instruction block at the top is **not included**.


### Reason
- it adds unnecessary clutter to the top of the page
- the subtitle already explains enough at the beginning
- guidance is more useful near submission, when the user is ready to act


---


# 7. Final Section Order


The Setup View will follow this exact order:


1. **Goal Definition**
2. **About Yourself**
3. **Your Preferences**
4. **Final Guidance + Generate Roadmap**


This order is intentional and should not be changed without a strong reason.


---


# 8. Section 1 — Goal Definition


## Purpose
This is the most important section of the page.
It collects the learner’s actual goal in natural language.


## Section Title
**What do you want to learn?**


## Optional Support Text
**Describe your goal in your own words.**


---


## Input 1 — Skill Goal Textarea


### Type
Large textarea


### Purpose
To allow the learner to freely explain what they want to learn.


### Design Intention
This textarea should feel like the most important field on the page.
It should visually resemble a modern prompt field:


- wider than normal inputs
- slightly taller
- expressive and open-ended
- easy to type into on mobile and desktop


### Placeholder
```text
Example: I want to learn MERN stack to build full-stack web applications and create real projects
```


### Notes
- this is the most prominent input on the page
- this field should be placed before every other setup field
- this field should feel central to the user’s interaction


---


## Input 2 — Goal Reason


### Label
**Why do you want to learn it?**


### Type
Select / Dropdown


### Options
- Build projects
- Prepare for job / internship
- Improve current skills
- Learn for university / studies
- Personal interest
- Other


### Placement Decision
This dropdown remains inside the **Goal Definition** section.


### Layout Rule
Even on desktop, this dropdown should stay **stacked below** the textarea.


### Why stacked?
- the textarea is the dominant element
- the dropdown is a supporting choice
- side-by-side layout would feel visually unbalanced


---


# 9. Section 2 — About Yourself


## Purpose
This section gives the app a small amount of learner context so the roadmap can start from the right level.


## Section Title
**Sharjeel, let us know a little about yourself**


This title should feel conversational and supportive.


---


## Input 3 — Role / Identity


### Type
Select / Dropdown


### Options
- Student
- Job Seeker
- Working Professional
- Other


---


## Input 4 — Current Skill Level


### Type
Select / Dropdown


### Options
- Beginner
- Intermediate
- Advanced


---


## Why only these two fields?
These two inputs are enough to influence roadmap difficulty and style.


### Intentionally excluded
- age
- city
- university name
- phone number
- username
- profile image


These are unnecessary for MVP roadmap generation.


---


# 10. Section 3 — Your Preferences


## Purpose
This section tells the app how the learner wants to study.


## Section Title
**Tell us how you want to learn**


---


## Input 5 — Daily Available Time


### Type
Select / Dropdown


### Options
- 30 minutes
- 1 hour
- 2 hours
- 3+ hours


---


## Input 6 — Preferred Pace


### Type
Select / Dropdown


### Options
- Slow
- Normal
- Fast


---


## Input 7 — Preferred Learning Style


### Type
Select / Dropdown


### Options
- Text-focused
- Practice-focused
- Mixed


---


# 11. Final Input Count


## Total Input Controls
**7 controls**


### Goal Definition
1. Skill Goal (textarea)
2. Goal Reason (dropdown)


### About Yourself
3. Role / Identity
4. Current Skill Level


### Your Preferences
5. Daily Available Time
6. Preferred Pace
7. Preferred Learning Style


## Why this count is appropriate
- enough to generate a good roadmap
- small enough to keep the page easy to complete
- avoids overwhelming the learner


---


# 12. Final Guidance Block


## Placement
This block should appear **near the final submission area**, not at the top of the page.


## Purpose
To explain why the app is asking for this data at the exact moment before submission.


## Approved Guidance Text
**We use your answers to create a structured roadmap and guide your daily learning flow.**


## Why this placement works
- the user has already entered the data
- now the app explains the purpose before final action
- trust increases at the right moment


---


# 13. Action Area


## Primary Button
**Generate Roadmap**


This is the page’s main action and should be visually dominant.


## Secondary Action
Optional small text link:
- Back


### Recommendation
Do not make Back a strong button.
A small text link is enough if included at all.


### Why?
This screen is focused on one main action only:


> generate the roadmap


---


# 14. Validation Rules


## Required Fields
- skill goal
- goal reason
- role / identity
- current skill level
- daily available time
- preferred pace
- preferred learning style


---


## Special Validation for Skill Goal


### Rules
- must not be empty
- should not be too short


### Recommended minimum
At least **10 characters**


### Why?
Because vague inputs produce weak roadmaps.


#### Weak input example
```text
MERN
```


#### Better input example
```text
I want to learn MERN stack to build web applications and create projects
```


---


# 15. View States


The Setup View must support the following states.


## 15.1 Idle
Normal form state before submission


## 15.2 Validation Error
- field-level error messages should appear under inputs
- form values must remain visible
- page should not reset


## 15.3 Generating Roadmap
This state begins when the user clicks **Generate Roadmap**.


### During this state
- button becomes disabled
- button text changes to:
  **Generating Roadmap...**
- optional small loader/spinner may appear


### Optional helper line during generation
**Please wait while your roadmap is being generated.**


## 15.4 Generation Failed
If roadmap generation fails:
- show error alert
- preserve all entered values
- allow immediate retry


## 15.5 Generation Success
No separate success screen is needed.


### On success
Navigate directly to:
```text
/roadmap
```


---


# 16. Mobile Design Rules


## Core Mobile Rule
The Skill Goal textarea must be the hero field of the page.


## Mobile Rules
- single-column layout only
- all inputs full width
- no side-by-side controls
- clear spacing between sections
- textarea should be large but not oversized
- dropdowns should be thumb-friendly
- button should be full width
- page should scroll naturally from top to bottom


## Mobile Visual Order
```text
Header
→ Goal Definition
→ About Yourself
→ Your Preferences
→ Final Guidance
→ Generate Roadmap Button
```


---


# 17. Desktop Design Rules


## Desktop Rules
- still one centered setup form
- fields remain stacked vertically
- textarea remains visually dominant
- sections remain clearly separated
- no side panels
- no two-column split


## Why keep desktop simple too?
Because this view is not content-heavy.
It is a focused form task, so clarity matters more than layout complexity.


---


# 18. What Is Intentionally Excluded


To keep the Setup View clean and focused, the following are intentionally excluded:


- no age field
- no city field
- no username field
- no phone number field
- no profile image upload
- no long biography field
- no multi-step wizard
- no side panel
- no roadmap preview inside same page
- no advanced preference matrix


---


# 19. Functional Decisions Locked in This Proposal


If this design is approved, the following decisions are considered locked:


- conversational subtitle includes user name
- goal definition appears first
- goal textarea is the most prominent field
- goal reason stays inside the goal section
- “About yourself” appears second
- “Your preferences” appears third
- final guidance appears near submission
- setup is a single-page form
- no extra bio-data is collected


---


# 20. Textual Wireframe Preview


```text
/setup


[ Header ]
  Let’s build your learning plan
  Sharjeel, tell us what you want to learn and we’ll turn it into a structured roadmap.


[ Section 1 — Goal Definition ]
  What do you want to learn?
  Describe your goal in your own words.
  [ Large Textarea ]


  Why do you want to learn it?
  [ Select Dropdown ]


[ Section 2 — About Yourself ]
  Sharjeel, let us know a little about yourself
  Role / Identity [Select]
  Current Skill Level [Select]


[ Section 3 — Your Preferences ]
  Tell us how you want to learn
  Daily Available Time [Select]
  Preferred Pace [Select]
  Preferred Learning Style [Select]


[ Final Guidance ]
  We use your answers to create a structured roadmap and guide your daily learning flow.


[ Generate Roadmap ]
```


---


# 21. Final Summary


The Setup View is designed to be:


- conversational
- goal-first
- structured
- mobile-first
- simple enough for MVP
- strong enough to support roadmap generation


This design avoids unnecessary fields and keeps the learner’s goal at the center of the experience.


---]
roadmap view design :[# Roadmap View Design
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


---]
review them if you find any discrepencies tell me about that and give me feedback of what i am doing wrong towards development for the students at my level 