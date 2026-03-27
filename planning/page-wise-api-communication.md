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
