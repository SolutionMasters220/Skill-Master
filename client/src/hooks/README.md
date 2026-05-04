# Hooks

## Purpose
Provides custom React hooks that expose global state management (authentication, app state) and theme functionality to components throughout the application, serving as the primary interface for accessing shared state.

## Responsibility Boundary
**Responsible for:**
- Exposing authentication state and methods (login, signup, logout) to consuming components
- Exposing app-level state like active roadmap data and progress tracking
- Managing theme state with localStorage persistence and DOM synchronization

**NOT responsible for:**
- Managing the context providers themselves (those live in `/context`)
- API calls (those are in `/api`)
- Component-specific local state
- Global configuration or settings beyond theme

## Contents

| File | Type | Purpose |
|------|------|---------|
| `useAuth.js` | Re-export | Facade hook that re-exports the `useAuth` hook from AuthContext for accessing user, loading state, and auth methods |
| `useApp.js` | Re-export | Facade hook that re-exports the `useApp` hook from AppContext for accessing roadmap data and progress |
| `useTheme.js` | Custom Hook | Manages light/dark theme state with localStorage persistence and DOM class synchronization |

## How It Works

### useAuth
**Entry point:** Any component that needs authentication state or methods

```
Component calls useAuth()
    ↓
Hook returns { user, loading, hasRoadmap, login, signup, logout }
    ↓
Component accesses user data or calls auth methods
    ↓
AuthContext state updates → Component re-renders
```

**Returns:**
- `user`: Current logged-in user object (null if not authenticated)
- `loading`: Boolean indicating if auth initialization is complete
- `hasRoadmap`: Boolean indicating if user has selected a learning roadmap
- `login(email, password)`: Async function that authenticates user and stores token
- `signup(name, email, password)`: Async function that creates account and stores token
- `logout()`: Function that clears token and user state

### useApp
**Entry point:** Components displaying roadmap content, progress, or learning paths

```
Component calls useApp()
    ↓
Hook returns { roadmapId, roadmapJson, progress, roadmapLoading, setRoadmapData, refreshProgress }
    ↓
Component displays roadmap structure or tracks user progress
    ↓
AppContext state updates → Component re-renders
```

**Returns:**
- `roadmapId`: ID of the currently active learning roadmap
- `roadmapJson`: Structured roadmap data (skills, levels, tasks)
- `progress`: User's progress object tracking completion status
- `roadmapLoading`: Boolean indicating if roadmap data is being fetched
- `setRoadmapData(id, json, prog)`: Function to update roadmap state manually
- `refreshProgress()`: Async function to re-fetch progress from server

### useTheme
**Entry point:** Components that need theme switching or styling logic

```
Hook initializes from localStorage on mount
    ↓
Hook reads "sm-theme" value (default: "dark")
    ↓
Applies theme class to <html> element
    ↓
Component calls toggleTheme()
    ↓
Theme state updates → DOM class changes → Styles update via CSS
```

**Returns:**
- `theme`: Current theme value ("dark" or "light")
- `toggleTheme()`: Function that switches between dark and light theme

**Side effects:**
- Reads/writes "sm-theme" key to localStorage
- Adds/removes "dark" and "light" classes on document.documentElement
- Re-runs when theme changes to keep DOM and storage in sync

## Key Design Decisions

### 1. **Re-export pattern for useAuth and useApp**
**Decision:** useAuth and useApp are simple re-exports from their respective contexts rather than wrapper implementations.

**Why:** Reduces boilerplate and provides a single, predictable import location. Developers expect hooks to live in the `/hooks` folder.

**Alternative considered:** Implementing additional logic in these hooks (e.g., caching, computed values). Would add unnecessary coupling.

### 2. **useTheme as actual implementation (not re-export)**
**Decision:** useTheme contains full implementation logic including localStorage sync and DOM manipulation.

**Why:** Theme is a presentational concern specific to the client, not central business state. Keeps it decoupled from the Context API used for domain state (auth, app).

**Alternative considered:** Moving theme into a context provider. Would bloat AppContext with UI concerns.

### 3. **localStorage as single source of truth for theme**
**Decision:** Theme value is persisted to "sm-theme" key in localStorage.

**Why:** Preserves user preference across browser sessions; modern UX expectation. Accessed on page load before React hydration in SSR scenarios.

**Alternative considered:** Only storing in React state. Would reset theme on every page refresh, poor UX.

### 4. **DOM classList manipulation for theme application**
**Decision:** Theme state directly updates `document.documentElement.classList`.

**Why:** Allows CSS to react to theme without additional state management. Tailwind/PostCSS can use `.dark` selector natively. Immediate visual feedback.

**Alternative considered:** Context-based theming wrapper. Would add component tree depth and re-render overhead.

## Data Flow

```
[Authentication Flow]
User submits login form
    ↓
Component calls useAuth().login(email, password)
    ↓
API call to /auth/login
    ↓
Token stored in localStorage; setUser() called
    ↓
AuthContext updates { user, hasRoadmap }
    ↓
Component re-renders with new user data

[Roadmap/Progress Flow]
Component mounts, calls useApp()
    ↓
AppContext effect triggers getActiveRoadmap() API call
    ↓
Roadmap structure (JSON) + progress loaded
    ↓
AppContext updates { roadmapId, roadmapJson, progress }
    ↓
Component re-renders with roadmap data

[Theme Flow]
User clicks theme toggle
    ↓
Component calls useTheme().toggleTheme()
    ↓
setTheme() updates state to "dark" or "light"
    ↓
useEffect runs: class applied to <html>, localStorage updated
    ↓
CSS media queries react to .dark/.light class
    ↓
UI colors update instantly
```

## Dependencies

### Depends On:
- `../context/AppContext` — Provides application state management (active roadmap, progress)
- `../context/AuthContext` — Provides authentication state and methods
- `react` — useState, useEffect hooks for local state and side effects
- `../api/roadmap.api` — (via AppContext) Fetches active roadmap and progress data

### Depended On By:
- All components in `/pages` — Use useAuth and useApp for data display
- Components in `/components/layout` — Use useAuth for user profile, useTheme for toggle
- Any component needing theme, auth state, or roadmap data

## Common Mistakes / Gotchas

1. **Calling hooks outside of React components**
   - ❌ Don't: Calling `useAuth()` in a module-level function or API service
   - ✅ Do: Call hooks only inside functional components or other custom hooks

2. **Not checking loading state before accessing user data**
   - ❌ Don't: `const { user } = useAuth(); return user.name;` (crashes if user is null during loading)
   - ✅ Do: `const { user, loading } = useAuth(); if (loading) return <Spinner />; return user.name;`

3. **Calling useAuth in non-protected routes**
   - ❌ Don't: Rendering user data on the login page where user is always null
   - ✅ Do: Use ProtectedRoute wrapper to ensure component only renders when authenticated

4. **Theme not persisting after page refresh**
   - ❌ Don't: Assume state persists if you clear localStorage manually
   - ✅ Do: useTheme automatically re-reads localStorage on mount

5. **Multiple calls to useTheme or useAuth causing unnecessary re-renders**
   - ❌ Don't: Calling `const { theme } = useTheme()` in multiple child components (okay, but can be optimized)
   - ✅ Do: Prefer lifting state to parent or using context selector if available

## Extension Points

### Adding a New Hook
1. **If exposing context state:** Create the hook in `/context` (e.g., `useFeatureContext()`), then re-export it here
   ```javascript
   // hooks/useFeature.js
   export { useFeature } from "../context/FeatureContext";
   ```

2. **If managing local state with side effects:** Implement directly in this directory
   ```javascript
   // hooks/useNewFeature.js
   import { useState, useEffect } from "react";
   
   export function useNewFeature() {
     const [state, setState] = useState(null);
     useEffect(() => {
       // Side effect logic
     }, []);
     return { state, setState };
   }
   ```

3. **Update imports in consuming components:**
   ```javascript
   import { useNewFeature } from "../hooks/useNewFeature";
   ```

### Modifying useTheme
- To add a third theme option (e.g., "auto"), update the toggle logic and localStorage key handling
- To use system preference, wrap theme initialization with `window.matchMedia("(prefers-color-scheme: dark)")`
- To persist theme to backend, add API call in the useEffect that stores localStorage

### Adding Methods to useAuth or useApp
- Modify the context provider (`/context/AuthContext.jsx` or `/context/AppContext.jsx`)
- Ensure the hook re-export remains a simple facade; all logic lives in the provider
