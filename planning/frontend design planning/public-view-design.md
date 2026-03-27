# Public View Design
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
[ Product Intro Panel ] [ Auth Form Panel ]   ← desktop
[ Auth Form Panel ]
[ Product Intro Panel ]                        ← mobile
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

---
