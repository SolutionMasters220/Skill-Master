# Client

## Purpose
React-based single-page application providing an interactive learning platform where users can authenticate, follow personalized skill roadmaps, complete lessons and exercises, and track their learning progress.

## Responsibility Boundary
**Responsible for:**
- User authentication and authorization flows
- Rendering UI pages and components
- Managing local client-side state (user session, roadmap data, progress)
- Communicating with the backend API via Axios
- Displaying learning content, sessions, and progress visualizations

**NOT responsible for:**
- Backend API logic, database operations, or user data storage
- Authentication token generation or validation (backend does this)
- Content creation or curriculum design (managed by backend)
- Analytics or detailed logging (Vercel Analytics passthrough only)

## Contents

| File/Folder | Type | Purpose |
|---|---|---|
| **src/App.jsx** | Component | Root component defining main routes: /auth, /setup, /roadmap, /learn, /progress, /session |
| **src/main.jsx** | Entry | Application bootstrap entry point |
| **src/index.css** | Stylesheet | Global CSS and Tailwind directives |
| **src/api/** | Layer | Axios configuration and API service functions for backend communication |
| **src/components/ui/** | Components | Reusable UI primitives (Badge, Button, Card, Spinner, etc.) |
| **src/components/layout/** | Components | Layout wrappers (AppShell, Navbar, Footer, BottomTabBar) |
| **src/context/** | State | AuthContext (user session), AppContext (roadmap & progress) |
| **src/hooks/** | Utilities | Custom React hooks (useAuth, useApp, useTheme) |
| **src/pages/** | Components | Page-level components for each route |
| **src/routes/ProtectedRoute.jsx** | Security | Route guard that requires authentication before access |
| **src/utils/** | Utilities | Helper functions for tokens, sessions, validation |
| **vite.config.js** | Config | Vite build configuration with React plugin |
| **tailwind.config.js** | Config | Tailwind CSS theme with dark mode and custom colors |
| **package.json** | Config | Dependencies and build scripts |
| **eslint.config.js** | Config | ESLint rules for code quality |

## How It Works

**1. Application Initialization**
- `main.jsx` mounts React app into DOM
- `App.jsx` wraps providers: `<AuthProvider>` → `<AppProvider>` → `<Routes>`

**2. Authentication Flow**
- User arrives at `/auth` (unauthenticated)
- Provides email/password, calls `loginUser()` or `signupUser()` from `auth.api.js`
- Backend returns user object + JWT token
- Token stored in `localStorage` with key `sm_token`
- `AuthContext` updates with user state

**3. Lazy Loading State on Page Refresh**
- `AuthContext.useEffect` runs on mount
- Retrieves token from `localStorage`
- Calls `getMe()` to restore user session from backend
- Sets `loading: false` when complete
- If 401 error occurs, token is cleared and user redirected to `/auth`

**4. Automatic Authorization**
- `axiosInstance.js` intercepts every outgoing request
- Retrieves token from `localStorage`
- Attaches `Authorization: Bearer <token>` header
- Response interceptor catches 401 and redirects to `/auth`

**5. Protected Routes**
- User navigates to `/setup` or `/roadmap`
- `ProtectedRoute` component checks: `loading` and `user`
- If not loading and no user → redirects to `/auth`
- If `isRestoring` is true → shows loading spinner while state restores
- Otherwise renders `<Outlet />` to display requested page

**6. App State & Roadmap Loading**
- `AppContext.useEffect` triggers when `user` changes
- Calls `getActiveRoadmap()` from backend
- Retrieves user's assigned roadmap, its JSON structure, and progress
- Stores in context: `roadmapId`, `roadmapJson`, `progress`
- Pages access via `useApp()` hook

**7. Page Rendering**
- Pages render based on route match (e.g., `/learn` → `<LearnPage />`)
- Pages fetch page-specific data via API services (progress.api.js, session.api.js, etc.)
- Display UI components, update context as needed
- Mobile layout uses `BottomTabBar`; desktop uses `Navbar`

## Key Design Decisions

| Decision | Why | Alternative |
|---|---|---|
| **Context API** for state management | Adequate for app size; avoids Redux boilerplate and learning curve | Redux, Zustand, Jotai |
| **Axios interceptors** for auth | Centralized, DRY: every request auto-includes token without per-call boilerplate | Fetch API with manual headers, Apollo Client |
| **Protected routes pattern** | Clear separation: public pages (auth) vs. guarded pages; prevents flash of login screen | Redirect in effect hooks, middleware in backend |
| **Tailwind CSS** for styling | Utility-first approach is fast; dark mode included; custom theme matches design system | CSS-in-JS, styled-components, SCSS |
| **Vite** for bundling | Fast dev server with HMR; modern ESM support; smaller config than Create React App | Webpack, Create React App |
| **localStorage** for token | Simple, persistent across refreshes; readable for debugging | Session storage, cookies (requires backend CORS config) |
| **Separate API services** (`auth.api.js`, `roadmap.api.js`) | Organized, testable, easy to mock; encapsulates endpoint logic | Inline API calls in components |
| **Custom hooks** (`useAuth`, `useApp`) | Abstracts context access; can add logic without modifying components | Direct `useContext()` calls everywhere |

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Browser (Client)                                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  User Input (Login) → AuthPage                              │
│         ↓                                                    │
│  loginUser(email, password)  [auth.api.js]                 │
│         ↓                                                    │
│  axios POST /auth/login  [axiosInstance.js]                │
│         ↓                                                    │
│  ← Response: { token, user, hasRoadmap }                   │
│         ↓                                                    │
│  AuthContext.setUser(user)                                 │
│  localStorage.setItem('sm_token', token)                   │
│         ↓                                                    │
│  Navigate to /setup (if hasRoadmap=false)                  │
│  or /learn (if hasRoadmap=true)                            │
│         ↓                                                    │
│  ProtectedRoute checks: user exists? → YES                 │
│  AppContext.useEffect triggers                              │
│         ↓                                                    │
│  getActiveRoadmap()  [roadmap.api.js]                      │
│         ↓                                                    │
│  axios GET /roadmap/active  [with token in header]         │
│         ↓                                                    │
│  ← Response: { roadmapId, roadmapJson, progress }          │
│         ↓                                                    │
│  AppContext.setRoadmapData(id, json, progress)             │
│  Pages can now render roadmap via useApp() hook            │
│         ↓                                                    │
│  User clicks "Start Session" (SessionPage)                 │
│  Fetches session data via session.api.js                   │
│         ↓                                                    │
│  Completes phases: Lesson → MiniExercise → Task → Feedback │
│         ↓                                                    │
│  Calls submitSession(), submitProgress()                   │
│  Backend updates database, returns updated progress         │
│         ↓                                                    │
│  AppContext.refreshProgress() called                        │
│  UI updates with new progress metrics                       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Dependencies

### Depends On:
- **Backend API** (server/) - Provides `/auth`, `/roadmap`, `/progress`, `/session` endpoints
- **@vercel/analytics** - Client-side analytics tracking
- **React & React-DOM** - Core UI library
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client with interceptor support
- **Tailwind CSS** - Utility-first styling framework
- **React Icons** - Icon library
- **React Markdown** - Markdown rendering for lesson content
- **Vite** - Build tool and dev server

### Depended On By:
- **Vercel** - Host/deployment platform (reads vite.config.js, package.json)
- **Users** - Anyone accessing the Skill Master application

## Common Mistakes / Gotchas

1. **Forgetting `localStorage` token key `sm_token`** - If you rename it, auth will break everywhere because `axiosInstance.js` and `AuthContext.jsx` all expect this exact key.

2. **Calling context values before provider mounts** - If you try to use `useAuth()` or `useApp()` outside the provider tree, you'll get null/undefined errors. Always ensure providers wrap the component.

3. **Making API calls in render** - Fetching in component render instead of useEffect causes infinite loops. Always use `useEffect(() => { fetchData() }, [dependency])`.

4. **Not handling 401 responses** - If the interceptor doesn't redirect on 401, users see broken state instead of returning to login. The interceptor in `axiosInstance.js` prevents this but don't remove it.

5. **Hardcoding API URL** - The `axiosInstance` requires `VITE_API_URL` environment variable. Without it, the app throws an error on startup. Set it in `.env` file or CI/CD.

6. **Breaking the ProtectedRoute chain** - If you add new protected pages but skip wrapping them with `ProtectedRoute`, unauthenticated users can access them.

7. **State not persisting on refresh** - `AuthContext` and `AppContext` intentionally refetch from API on page refresh to stay in sync. Don't try to serialize entire state to localStorage; sync via API instead.

8. **Incorrect Tailwind class usage** - Dark mode is triggered by `dark:` prefix and requires `darkMode: "class"` in config. If dark class isn't on document root, dark styles won't apply.

## Extension Points

### Adding a New API Endpoint
1. Create service function in appropriate file under `src/api/` (e.g., `src/api/stats.api.js`)
2. Import `api` from `axiosInstance.js`
3. Define function: `export const getStats = async () => { return (await api.get('/stats')).data; }`
4. Import in component and call within `useEffect`

### Adding a New Page
1. Create folder under `src/pages/` with component file (e.g., `src/pages/StatsPage/StatsPage.jsx`)
2. Add route in `App.jsx`:
   ```jsx
   <Route element={<ProtectedRoute />}>
     <Route element={<AppShell />}>
       <Route path="/stats" element={<StatsPage />} />
     </Route>
   </Route>
   ```
3. Add link in navigation (`src/components/layout/Navbar.jsx` or `BottomTabBar.jsx`)

### Adding a New UI Component
1. Create file in `src/components/ui/` (e.g., `Badge.jsx`)
2. Export React component with clear prop interface
3. Import and use in other components: `<Badge label="New" color="blue" />`
4. Style using Tailwind classes; use custom colors from `tailwind.config.js`

### Adding Global State
1. Create context file: `src/context/MyContext.jsx`
2. Define provider and hook: `export function MyProvider({ children }) { ... }` and `export const useMyContext = () => useContext(MyContext)`
3. Add to `App.jsx` provider chain: `<MyProvider><Routes/></MyProvider>`
4. Use hook in components: `const { value } = useMyContext()`

### Adding Authentication Logic
1. Add new API service in `src/api/auth.api.js`
2. Call from `AuthContext.jsx` (e.g., refresh token, logout)
3. Update context state accordingly
4. If affects protected routes, update `ProtectedRoute.jsx` logic

### Adding Validation
1. Add validator functions to `src/utils/validators.js`
2. Import in forms/components
3. Call before API submission: `if (!isValidEmail(email)) { setError(...) }`
4. Display error message to user

### Debugging
- **Auth stuck?** Check browser DevTools → Application → LocalStorage for `sm_token`
- **API calls failing?** Open DevTools → Network tab, inspect request headers (should have Authorization header)
- **State not updating?** Check if action dispatches context setter correctly; use React DevTools Context inspector
- **Styles not applying?** Verify Tailwind classes are spelled correctly; check `tailwind.config.js` for custom colors
