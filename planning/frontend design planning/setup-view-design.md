# Setup View Design
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

---
