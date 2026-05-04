# src

## Purpose
Centralized source code directory containing the complete React application logic, including routing, authentication, state management, API communication, UI components, pages, and utility functions.

## Responsibility Boundary
**Responsible for:**
- All React components, pages, and layouts
- Global state management (auth, app-level data)
- API service layer and HTTP communication
- Route definitions and access control
- Custom React hooks and utilities
- CSS and styling entry points

**NOT responsible for:**
- Backend API implementation (server/ folder)
- Build configuration (handled by vite.config.js)
- Third-party library implementations
- Environment variable setup (.env files)
- Package dependencies (managed by package.json)

## Contents

| File/Folder | Type | Purpose |
|---|---|---|
| **App.jsx** | Component | Root component defining all routes, providers, and top-level routing logic |
| **main.jsx** | Entry | Application bootstrap; mounts React to DOM |
| **index.css** | Stylesheet | Global CSS with Tailwind directives and base styles |
| **api/** | Layer | HTTP client configuration and backend API service functions |
| **components/** | Components | Reusable UI components organized into layout and ui subdirectories |
| **context/** | State | React Context definitions for AuthContext and AppContext |
| **hooks/** | Utilities | Custom React hooks (useAuth, useApp, useTheme) |
| **mocks/** | Data | Mock/sample data for development and testing |
| **pages/** | Components | Page-level components for each route (Auth, Learn, Roadmap, etc.) |
| **routes/** | Security | Route guards and access control (ProtectedRoute) |
| **utils/** | Utilities | Helper functions for tokens, sessions, validation, and day calculations |

## How It Works

**1. Application Initialization**
```
Browser loads index.html → main.jsx → App.jsx mounted
                    ↓
           AuthProvider wraps app
           (checks localStorage for token, restores session)
                    ↓
           AppProvider wraps app
           (loads user's roadmap & progress if authenticated)
                    ↓
           BrowserRouter enables client-side routing
                    ↓
           Routes resolve based on current path
```

**2. Authentication Flow**
```
User visits /auth → AuthPage component renders
    ↓
User enters credentials, clicks Login/Signup
    ↓
AuthPage calls useAuth hook → auth.login() or auth.signup()
    ↓
auth.api.js sends POST request via axiosInstance
    ↓
Backend validates, returns { token, user, hasRoadmap }
    ↓
AuthContext stores token in localStorage, updates user state
    ↓
useNavigate redirects to /setup or /learn
```

**3. Protected Access Flow**
```
User navigates to protected route (e.g., /roadmap)
    ↓
ProtectedRoute component checks:
  - Is auth loading? Show spinner
  - Is user null? Redirect to /auth
  - Is app state restoring? Show spinner
  - Otherwise, render <Outlet /> (the page)
    ↓
Page component renders and can call useAuth() or useApp() hooks
```

**4. API Communication Pattern**
```
Page component in useEffect:
  - Calls API service function (e.g., getActiveRoadmap())
    ↓
API service function (in api/roadmap.api.js):
  - Uses axiosInstance client
  - Makes HTTP request
    ↓
axiosInstance request interceptor:
  - Retrieves token from localStorage
  - Attaches Authorization header
  - Sends request to backend
    ↓
Backend processes, returns response
    ↓
axiosInstance response interceptor:
  - If 401: clears token, redirects to /auth
  - Otherwise: returns data to service function
    ↓
Service function returns response.data to component
    ↓
Component updates local state or context
```

**5. State Management Flow**
```
AuthContext (global auth state):
  - Stores: user, loading, hasRoadmap
  - Provides: login(), signup(), logout()
  - Accessed via: useAuth() hook or direct import

AppContext (global app state):
  - Stores: roadmapId, roadmapJson, progress, roadmapLoading
  - Provides: setRoadmapData(), refreshProgress()
  - Accessed via: useApp() hook
  - Depends on: user from AuthContext
```

**6. Component Hierarchy**
```
App (router setup)
  ├── AuthProvider
  │   ├── AppProvider
  │   │   ├── BrowserRouter
  │   │   │   ├── Route /auth → AuthPage
  │   │   │   ├── Route (protected)
  │   │   │   │   ├── Route /setup → SetupPage
  │   │   │   │   └── Route (with AppShell)
  │   │   │   │       ├── Route /roadmap → RoadmapPage
  │   │   │   │       ├── Route /learn → LearnPage
  │   │   │   │       ├── Route /progress → ProgressPage
  │   │   │   │       └── Route /session/:dayId → SessionPage
  │   │   │   └── Route 404 → NotFoundPage
  │   │   └── Analytics (Vercel)
```

## Key Design Decisions

| Decision | Why | Alternative |
|---|---|---|
| **Context API for state** | Simple, sufficient for app size; avoids Redux complexity | Redux, Zustand, MobX |
| **Axios interceptors** | Centralized auth logic; automatic token injection; DRY; single source of truth for request/response handling | Fetch API with manual headers, Apollo Client, custom middleware |
| **ProtectedRoute component** | Clear separation of concerns; renders conditionally based on auth state; prevents auth UI flashing | Redux middleware, router guards in backend, HOCs |
| **Custom hooks (useAuth, useApp)** | Abstracts context lookup; enables logic encapsulation; easier testing; less boilerplate in components | Direct useContext() calls, HOCs, render props |
| **Service functions in api/** | Organized, testable, mockable; encapsulates endpoint URLs and payload shapes; single responsibility | Inline fetch in components, GraphQL queries, tRPC |
| **localStorage for token** | Persists across page refreshes; simple; works offline; readable for debugging | SessionStorage (lost on tab close), cookies (CSRF setup), IndexedDB (overkill) |
| **AppShell layout wrapper** | Consistent layout across authenticated pages; wraps pages with Navbar, Footer, BottomTabBar; ensures mobile-first design | Layout in each page, nested providers, CSS-only layout |
| **ErrorBoundary in AppShell** | Catches React rendering errors; prevents white screen of death; provides fallback UI | No error boundary, try-catch in useEffect |
| **Tailwind + custom colors** | Utility-first CSS; dark mode support; performance; custom brand colors in config | Styled-components, CSS modules, CSS-in-JS |
| **Separate layout/ and ui/** | Separation: layout components are shells/wrappers, ui components are primitives; prevents mixing concerns | Single components/ folder, flat structure |

## Data Flow

```
AUTHENTICATION FLOW:
  Input: Credentials (email, password) from user
    ↓
  Process:
    1. Component collects form input
    2. Validates locally
    3. Calls auth.login() or auth.signup()
    4. API service POSTs to backend
    5. Axios interceptor adds Authorization header
    6. Backend validates, returns token + user
    7. localStorage updated with token
    8. AuthContext state updated
    ↓
  Output: { token, user, hasRoadmap } stored in context + localStorage

ROADMAP LOADING FLOW:
  Input: Authenticated user (from AuthContext)
    ↓
  Process:
    1. AppContext useEffect triggers when user changes
    2. Calls getActiveRoadmap()
    3. API service GETs /roadmap/active with token header
    4. Backend queries database for user's roadmap
    5. Returns { roadmapId, roadmapJson, progress }
    6. AppContext stores values
    ↓
  Output: roadmapJson (curriculum structure), progress (user's completion state)

SESSION EXECUTION FLOW:
  Input: dayId from URL params (e.g., /session/day-1)
    ↓
  Process:
    1. SessionPage fetches session details via session.api.js
    2. Renders phases: LessonPhase → MiniExercise → TaskPhase → FeedbackPhase
    3. User submits answers at each phase
    4. Components call session.api.submitSession()
    5. Backend evaluates answers, updates progress
    6. Components call progress.api.getProgress() to refresh
    7. AppContext.refreshProgress() updates global state
    ↓
  Output: Updated progress, new badges/achievements, feedback for user

STATE UPDATES PROPAGATION:
  Local State (component) → re-render → user sees update
  Context State (AuthContext/AppContext) → all subscribed components re-render
  localStorage → persists across page refresh, used for restoration
  Backend API → source of truth for persistent data
```

## Dependencies

### Depends On:
- **Backend API** (server/) - All data CRUD operations, authentication, session evaluation
- **React** - Core UI library and hooks
- **React-DOM** - DOM rendering
- **React Router DOM** - Client-side routing and navigation
- **Axios** - HTTP client for API communication
- **Tailwind CSS** - Styling framework
- **React Icons** - Icon components
- **React Markdown** - Renders markdown lesson content
- **Vercel Analytics** - Usage tracking
- **localStorage** - Browser API for token persistence

### Depended On By:
- **Vite** (build tool) - Builds and bundles src/ code
- **Frontend tests** - Would import from src/ for unit testing
- **Backend** - Serves built HTML/JS to users

## Common Mistakes / Gotchas

1. **Using context values outside provider tree** - `useAuth()` or `useApp()` will throw if component isn't wrapped by provider. Always check component is nested inside `<AuthProvider>` and `<AppProvider>`.

2. **Calling API functions without context** - Some pages need data before AppContext loads. Solution: always check `roadmapLoading` before rendering with roadmap data.

3. **Forgetting to check `loading` state in ProtectedRoute** - If you skip the loading check, the page flashes "not authenticated" briefly on refresh. Always render spinner while loading is true.

4. **Making API calls in render** - This causes infinite loops. Always use `useEffect(() => { fetchData() }, [deps])`, never call fetch directly in component body.

5. **Missing dependency arrays in useEffect** - Omitting `[]` causes effect to run every render. Omitting dependencies causes stale closures. Always explicitly list dependencies.

6. **Calling logout but not redirecting** - `logout()` clears auth state but doesn't navigate. Use `useNavigate()` after logout to redirect to `/auth`.

7. **Modifying localStorage directly** - Use token helper functions (`saveToken`, `getToken`, `clearToken`) instead of `localStorage.setItem()` directly; keeps token key in one place.

8. **Not handling 401 errors** - The Axios interceptor handles this globally, but if you remove it or forget to import axiosInstance, requests won't auto-redirect on 401.

9. **Breaking the ProtectedRoute chain** - If you add a new protected page but don't nest it inside `<ProtectedRoute />` in App.jsx, unauthenticated users can access it.

10. **Hardcoding API URLs** - Use `api.baseURL` or environment variables. Never hardcode `http://localhost:3000` because it breaks in production.

11. **Not resetting form state** - After login/signup, if you don't clear form inputs, they persist on page return. Clear input state on success or on mode switch.

12. **Dark mode classes not working** - Dark mode requires `dark:` prefix and `darkMode: "class"` in Tailwind config. Without the config, dark styles won't apply.

## Extension Points

### Adding a New Page
1. Create folder under `pages/` (e.g., `StatsPage/`)
2. Create component file: `StatsPage.jsx`
3. Add route in `App.jsx`:
   ```jsx
   <Route element={<ProtectedRoute />}>
     <Route element={<AppShell />}>
       <Route path="/stats" element={<StatsPage />} />
     </Route>
   </Route>
   ```
4. Add navigation link in `components/layout/Navbar.jsx` or `BottomTabBar.jsx`

### Adding a New API Endpoint
1. Create service file in `api/` (e.g., `stats.api.js`)
2. Import `api` from `axiosInstance.js`
3. Define function:
   ```js
   export const getStats = async () => {
     const res = await api.get('/stats');
     return res.data;
   };
   ```
4. Import and use in components via `useEffect`

### Adding a New UI Component
1. Create file in `components/ui/` (e.g., `Badge.jsx`)
2. Define component with props interface:
   ```jsx
   export default function Badge({ label, color = "blue" }) {
     return <span className={`bg-${color}-500 text-white px-2 py-1 rounded`}>{label}</span>;
   }
   ```
3. Import and use: `<Badge label="New" color="green" />`
4. Style with Tailwind classes; use custom colors from `tailwind.config.js`

### Adding Global State
1. Create context file: `context/MyContext.jsx`
2. Define provider and hook:
   ```jsx
   const MyContext = createContext(null);
   
   export function MyProvider({ children }) {
     const [state, setState] = useState(null);
     return (
       <MyContext.Provider value={{ state, setState }}>
         {children}
       </MyContext.Provider>
     );
   }
   
   export function useMyContext() {
     const ctx = useContext(MyContext);
     if (!ctx) throw new Error("useMyContext must be inside MyProvider");
     return ctx;
   }
   ```
3. Add provider to `App.jsx`: `<MyProvider><AppProvider>...</MyProvider>`
4. Use hook in components: `const { state } = useMyContext()`

### Adding Protected Routes
1. Define route in `App.jsx` nested under `<ProtectedRoute />`
2. Route will automatically check auth state and show loading spinner
3. Only render page if user is authenticated

### Adding Form Validation
1. Add validator functions to `utils/validators.js`
2. Call in component before API submission:
   ```js
   if (!validators.isValidEmail(email)) {
     setError("Invalid email");
     return;
   }
   ```
3. Display error to user in UI

### Debugging
- **Auth not persisting?** Check localStorage for `sm_token` key via DevTools → Application → LocalStorage
- **API requests missing token?** Open DevTools → Network → inspect request headers for `Authorization: Bearer <token>`
- **Context returning null?** Ensure component is inside provider tree; check error message for which provider
- **Page won't load?** Check ProtectedRoute logic; look for `isRestoring` flag in AppContext
- **Styles not applying?** Verify Tailwind class names are correct; check `dark:` prefix exists for dark mode
- **useEffect running infinitely?** Check dependency array is correct and dependencies are stable
