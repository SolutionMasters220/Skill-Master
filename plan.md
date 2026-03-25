# 🚀 SHARJEEL'S SKILL MASTER BUILD ROADMAP
## 18-Day Project-Oriented Learning Sprint

**TARGET:** Build Skill Master MVP with full understanding and full code control  
**CURRENT POSITION:** React basics known (components, props, `useState`, events, list rendering)  
**APPROACH:** Learn only the required concepts → apply them immediately in the project  
**ROADMAP STYLE:** 3-day sprints → 2 learning days + 1 project application day  
**PRIMARY GOAL:** No confusion, no overlearning, no no-code dependency

---

## 📌 MVP YOU WILL BUILD IN THESE 18 DAYS

By the end of this roadmap, **Skill Master MVP** should include:

- Register / Login UI + backend auth flow  
- Goal + preferences onboarding form  
- User goal sent for roadmap generation  
- Roadmap stored and shown as **Today’s Task** flow  
- Progress tracking (current day / week / module)  
- Sunday exam + fail-to-revision logic  
- AI feedback request on task answer  
- Clean project structure you fully understand

---

# 📅 SPRINT-BY-SPRINT BREAKDOWN

## ═══════════════════════════════════════════════════════
## SPRINT 1: FORMS, VALIDATION & USER INPUT FLOW (DAYS 1–3)
## ═══════════════════════════════════════════════════════

### **Day 1 — Controlled Forms in React**
**Topic:** Controlled inputs + form state  
**Goal:** Understand how form data lives inside React state  
**Why This Matters:** Skill Master starts from user input, so forms are the foundation

**Learning Objectives:**
- Manage multiple input fields with `useState`
- Understand controlled vs uncontrolled inputs
- Update form state on every change
- Handle select, radio, and text inputs cleanly

**Mini Practice:**
- Build a small test form with 4–5 fields
- Show entered values live in a preview section
- Practice updating multiple fields from one state object

**Project Chunk:**  
Build the **Goal & Preferences Form UI** for Skill Master

**Exact Fields to Build:**
- Skill goal / learning objective
- Current level
- Daily available time
- Learning pace
- Preferred style (text / practice / mixed)

**Deliverables:**
- `OnboardingForm.jsx`
- Inputs fully controlled
- Form data visible in console or preview box

---

### **Day 2 — Form Validation & Error Handling**
**Topic:** Validation in React forms  
**Goal:** Prevent incomplete or weak user input

**Learning Objectives:**
- Add required-field validation
- Show inline error messages
- Disable submit when form is invalid
- Keep validation simple and readable

**Mini Practice:**
- Add validation to yesterday’s test form
- Show error text under each invalid field
- Prevent empty submission
- Highlight invalid inputs visually

**Project Chunk:**  
Add validation to the **Goal & Preferences Form**

**Validation Rules:**
- Goal cannot be empty
- Level must be selected
- Daily time must be selected
- Pace must be selected
- At least one learning style chosen

**Deliverables:**
- Error messages under fields
- Submit button only works on valid form
- Clean user-friendly form behavior

---

### **Day 3 — Project Application: Auth + Onboarding Frontend**
**Topic:** Applying forms into real app screens  
**Goal:** Build the first real module of Skill Master

**Project Chunk:**  
Create the **entry flow UI** of the project

**What You Will Build:**
- Register page UI
- Login page UI
- Onboarding page UI
- Reusable form/input/button components

**Final Outcome of Sprint 1:**
- App has real starting screens
- User input flow is visible
- You understand how data enters the system

**Deliverables:**
- `LoginPage.jsx`
- `RegisterPage.jsx`
- `OnboardingPage.jsx`
- `components/Input.jsx`
- `components/Button.jsx`

**Git Commit Suggestion:**  
`feat: add auth and onboarding frontend forms`

---

## ═══════════════════════════════════════════════════════
## SPRINT 2: DATA FETCHING, SIDE EFFECTS & TODAY’S TASK UI (DAYS 4–6)
## ═══════════════════════════════════════════════════════

### **Day 4 — `useEffect` Basics + Fetching Data**
**Topic:** `useEffect` for data loading  
**Goal:** Learn how components fetch and show backend-like data

**Learning Objectives:**
- Understand when `useEffect` runs
- Fetch data on component mount
- Store fetched data in state
- Avoid infinite re-render mistakes

**Mini Practice:**
- Fetch dummy JSON from a local file or fake API
- Display loading state before data appears
- Render a simple list from fetched data

**Project Relevance:**  
Skill Master dashboard must load roadmap and progress data when page opens

**Deliverables:**
- Small test component using `useEffect`
- Fetch + render mock data successfully

---

### **Day 5 — Loading States, Error States & Conditional Rendering**
**Topic:** UI behavior during async fetch  
**Goal:** Make dashboard realistic and stable

**Learning Objectives:**
- Show loading text/spinner while fetching
- Show fallback if data is missing
- Render content only when fetch completes
- Use conditional rendering properly

**Mini Practice:**
- Create `loading`, `error`, and `success` states
- Simulate delayed response using `setTimeout`
- Practice rendering different UI for each state

**Project Chunk:**  
Prepare the **Today’s Task screen** to handle real data later

**What You Will Build:**
- `Loading...` state
- `No roadmap found` state
- `Today’s Task` card from mock roadmap JSON

**Deliverables:**
- `DashboardPage.jsx`
- `TodayTaskCard.jsx`
- Mock roadmap shown with proper UI states

---

### **Day 6 — Project Application: Dashboard + Today’s Task**
**Topic:** Real application of `useEffect` and rendering  
**Goal:** Build the first meaningful user-facing module

**Project Chunk:**  
Create the **Skill Master Dashboard (frontend only, mock data)**

**What You Will Build:**
- Welcome section
- Current skill title
- Current day / week display
- Today’s lesson
- Today’s task
- “Mark Complete” button (frontend only for now)

**Final Outcome of Sprint 2:**
- App now feels like a real learning system
- Dashboard has purpose, not placeholder content
- You understand why data fetching matters

**Deliverables:**
- `DashboardPage.jsx`
- `TodayTaskCard.jsx`
- `mockRoadmap.json`
- Project dashboard working with sample data

**Git Commit Suggestion:**  
`feat: add dashboard and today task with mock roadmap`

---

## ═══════════════════════════════════════════════════════
## SPRINT 3: ROUTING & COMPLETE USER FLOW (DAYS 7–9)
## ═══════════════════════════════════════════════════════

### **Day 7 — React Router Basics**
**Topic:** Client-side routing  
**Goal:** Turn separate screens into one connected app flow

**Learning Objectives:**
- Install React Router
- Create routes for pages
- Navigate using `Link`
- Understand page-based component structure

**Mini Practice:**
- Build a mini app with Home, About, Contact pages
- Add links in a navbar
- Move between pages without reload

**Project Relevance:**  
Skill Master has multiple screens, not a single-page widget

**Pages to Connect:**
- Login
- Register
- Onboarding
- Dashboard
- Task details
- Exam page

**Deliverables:**
- Router setup complete
- Navigation working between pages

---

### **Day 8 — Route Flow + App Navigation Logic**
**Topic:** App flow structure  
**Goal:** Understand how users should move inside the system

**Learning Objectives:**
- Redirect after onboarding
- Navigate after login
- Think in route-based user journey
- Separate public pages from private pages conceptually

**Mini Practice:**
- Navigate programmatically after button click
- Create a fake “protected page” idea
- Practice redirecting users based on state

**Project Chunk:**  
Design the real user flow of Skill Master

**Expected Flow:**
- New user → Register/Login
- First time → Onboarding
- After onboarding → Dashboard
- Dashboard → Task page / Exam page

**Deliverables:**
- App flow map implemented in routing
- Cleaner folder structure for pages

---

### **Day 9 — Project Application: Full Frontend Navigation**
**Topic:** Applying routing to actual project screens  
**Goal:** Finish the complete frontend page flow

**Project Chunk:**  
Integrate all existing screens into one coherent app

**What You Will Build:**
- Navigation layout
- Routed page transitions
- Redirect user to correct next screen
- Separate page components cleanly

**Final Outcome of Sprint 3:**
- Skill Master frontend now has real structure
- User can move through the app naturally
- Frontend foundation becomes stable

**Deliverables:**
- `App.jsx` with routes
- All pages linked
- Navigation flow ready for backend integration

**Git Commit Suggestion:**  
`feat: connect frontend pages with react router`

---

## ═══════════════════════════════════════════════════════
## SPRINT 4: EXPRESS BACKEND & CORE APIs (DAYS 10–12)
## ═══════════════════════════════════════════════════════

### **Day 10 — Express Basics + API Thinking**
**Topic:** Node.js + Express fundamentals  
**Goal:** Understand how backend serves the frontend

**Learning Objectives:**
- Create Express server
- Understand routes and controllers
- Accept JSON requests
- Send JSON responses
- Understand middleware concept

**Mini Practice:**
- Build a tiny Express app with 2–3 routes
- Return sample JSON from endpoints
- Test routes in browser or Postman

**Project Relevance:**  
Skill Master needs a backend for auth, roadmap, progress, and feedback

**Deliverables:**
- Express server running
- `/api/test` route working
- Basic backend folder structure

---

### **Day 11 — REST Endpoints for Skill Master**
**Topic:** Designing project-specific APIs  
**Goal:** Define backend endpoints according to app behavior

**Learning Objectives:**
- Think in resources and actions
- Separate auth, roadmap, progress routes
- Use proper request/response shape
- Test APIs using Postman / Thunder Client

**Endpoints to Design:**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/roadmap/generate`
- `GET /api/roadmap/current`
- `POST /api/progress/complete`
- `POST /api/feedback`

**Mini Practice:**
- Create routes with dummy responses
- Send sample request body
- Test endpoint responses manually

**Deliverables:**
- Route files created
- Dummy responses working
- APIs tested manually

---

### **Day 12 — Project Application: Backend Skeleton for Skill Master**
**Topic:** Applying Express to real project structure  
**Goal:** Build the backend shell of the project

**Project Chunk:**  
Create the **actual Skill Master backend structure**

**What You Will Build:**
- `routes/`
- `controllers/`
- `models/`
- `middleware/`
- Env config
- CORS + JSON parsing

**Final Outcome of Sprint 4:**
- Frontend no longer stands alone
- Project now has full-stack shape
- You understand where future logic will go

**Deliverables:**
- Working Express backend
- Clean route structure
- Ready for DB and auth integration

**Git Commit Suggestion:**  
`feat: setup express backend structure for skill master`

---

## ═══════════════════════════════════════════════════════
## SPRINT 5: DATABASE + AUTH + PERSISTENCE (DAYS 13–15)
## ═══════════════════════════════════════════════════════

### **Day 13 — MongoDB + Mongoose Basics**
**Topic:** MongoDB Atlas + Mongoose models  
**Goal:** Store real user and roadmap data

**Learning Objectives:**
- Connect backend to MongoDB
- Create schemas and models
- Understand validation in models
- Save and retrieve documents

**Project Models to Create:**
- `User`
- `Roadmap`
- `Progress`

**Mini Practice:**
- Create one sample user document
- Read documents from the database
- Add simple required validation to fields

**Deliverables:**
- DB connected successfully
- Three models created
- Basic create/read test working

---

### **Day 14 — JWT Auth + Protected Data**
**Topic:** Authentication with JWT  
**Goal:** Make roadmap and progress user-specific

**Learning Objectives:**
- Hash passwords before storing
- Create JWT on login
- Verify token in protected routes
- Understand auth middleware

**Project Chunk:**  
Implement **register/login backend + token flow**

**What You Will Build:**
- Register endpoint saves user
- Login endpoint returns token
- Protected route test using auth middleware
- Frontend stores token in localStorage

**Mini Practice:**
- Register a sample user
- Login and get token
- Test protected route with and without token

**Deliverables:**
- Working register/login flow
- Protected dashboard request possible
- User-specific identity available in backend

---

### **Day 15 — Project Application: Real Data Storage**
**Topic:** Connect frontend and DB-backed backend  
**Goal:** Replace mock flow with persistent system flow

**Project Chunk:**  
Make Skill Master store and retrieve real data

**What You Will Build:**
- Onboarding sends real data to backend
- Roadmap document prepared to be saved
- Progress document created for each roadmap
- Dashboard fetches data from backend instead of local mock

**Final Outcome of Sprint 5:**
- App becomes a real system, not frontend-only demo
- User data now persists across reloads
- You understand the full request-response cycle

**Deliverables:**
- Frontend connected to backend
- DB-backed flow for user + progress starts working

**Git Commit Suggestion:**  
`feat: connect frontend with auth and database-backed flow`

---

## ═══════════════════════════════════════════════════════
## SPRINT 6: AI INTEGRATION, LOGIC RULES & MVP COMPLETION (DAYS 16–18)
## ═══════════════════════════════════════════════════════

### **Day 16 — AI Roadmap Generation + JSON Validation**
**Topic:** Controlled AI API integration  
**Goal:** Generate roadmap content without losing control

**Learning Objectives:**
- Send prompt to AI API
- Receive structured JSON
- Validate required fields before saving
- Keep AI limited to content generation only

**Project Chunk:**  
Implement **`POST /api/roadmap/generate`**

**Roadmap Must Include:**
- Modules
- Weeks
- Days
- Lesson
- Task
- Sunday exam section

**Mini Practice:**
- Send a sample request to AI
- Log returned response
- Check if required keys exist before saving

**Deliverables:**
- AI returns structured roadmap
- Backend saves valid roadmap
- Invalid roadmap rejected safely

---

### **Day 17 — Progress Update + Exam Logic + Feedback**
**Topic:** Real project behavior rules  
**Goal:** Complete the learning loop of Skill Master

**Learning Objectives:**
- Advance day after task completion
- Track completed tasks
- Evaluate exam score
- Reset to revision on failed exam
- Get AI feedback on a user answer

**Project Chunk:**  
Implement the app’s core progression engine

**What You Will Build:**
- `POST /api/progress/complete`
- `POST /api/exam/submit`
- `POST /api/feedback`
- Frontend buttons connected to these flows

**Mini Practice:**
- Complete one dummy task and move next day
- Submit one sample exam and calculate score
- Request one AI feedback response

**Deliverables:**
- Task completion updates progress
- Exam pass/fail works
- Feedback appears in UI

---

### **Day 18 — Project Application: Final MVP Polish + Demo Prep**
**Topic:** Integration, cleanup, testing, and control  
**Goal:** Make Skill Master demo-ready and understandable

**Tasks:**
- Fix broken UI or API behavior
- Remove unnecessary code
- Add loading and error states
- Ensure roadmap is not regenerated repeatedly
- Prevent double submit
- Test full user journey end-to-end
- Write short README / setup notes

**Final Outcome of Sprint 6:**
- Skill Master MVP complete
- You know how every part works
- Code stays under your control
- Team can continue from a strong base

**Deliverables:**
- Complete MVP flow
- GitHub commits organized
- Demo-ready project
- Personal understanding of each module

**Git Commit Suggestion:**  
`feat: finalize skill master mvp and prepare demo`

---

## ✅ FINAL SELECTED CONCEPTS (ONLY WHAT YOU NEED)

This 18-day plan intentionally focuses on:

- Controlled forms + validation  
- `useEffect` + conditional rendering  
- React Router  
- Express basics + REST APIs  
- MongoDB + Mongoose  
- JWT authentication  
- AI integration (roadmap + feedback)  
- Progress rules + exam logic  

This roadmap intentionally does **not** focus on:

- Custom hooks  
- `useReducer`  
- `useRef`  
- React optimization tools  
- File upload  
- Advanced global state patterns  
- Unnecessary styling complexity  

---

## ✅ SPRINT EXIT CRITERIA

By Day 18, you should be able to say:

- I built Skill Master **myself**
- I understand **why** each concept was learned
- I can explain each project module clearly
- I did not rely on no-code AI agents
- I can continue building features with confidence

---

## ✅ DAILY REFLECTION TEMPLATE

At the end of each day, write this:

```markdown
1. Aaj maine kya concept seekha?
2. Skill Master ka konsa hissa build kiya?
3. Kahan atka aur kal kya continue karna hai?