# Context

## Purpose
Manages global application state through React Context API, providing authentication state and roadmap/progress data to the entire application.

## Responsibility Boundary
**Responsible for:**
- Authentication state (user identity, login/logout, token management)
- Active roadmap state (current roadmap ID, roadmap JSON, user progress)
- Exposing state and actions via custom hooks

**NOT responsible for:**
- Making API calls (delegates to `../api/` modules)
- Rendering UI components
- Routing logic
- Local component state

## Contents

| File | Type | Purpose |
|------|------|---------|
| `AuthContext.jsx` | Context + Provider + Hook | Manages user authentication state and session lifecycle |
| `AppContext.jsx` | Context + Provider + Hook | Manages active roadmap and progress data |

## How It Works

### Authentication Flow (AuthContext)
1. **Initialization**: On app load, checks `localStorage` for stored token
2. **Token Validation**: If token exists, calls `getMe()` API to validate and fetch current user
3. **State Update**: Sets user object and `hasRoadmap` flag based on API response
4. **Login**: Accepts credentials, calls `loginUser()` API, stores token, updates state
5. **Signup**: Accepts name/email/password, calls `signupUser()` API, stores token, sets user state
6. **Logout**: Clears token from localStorage and resets state

### Roadmap Flow (AppContext)
1. **Dependency**: Watches `user` state from AuthContext
2. **Fetch on Auth**: When user changes, calls `getActiveRoadmap()` API if user exists
3. **Cache State**: Stores roadmapId, roadmapJson, and progress in state
4. **Manual Refresh**: `refreshProgress()` method syncs progress with server
5. **State Updates**: `setRoadmapData()` allows components to update roadmap state after setup

## Key Design Decisions

- **Separate Contexts**: AuthContext and AppContext are split rather than combined because:
  - AuthContext must initialize before AppContext (dependency relationship)
  - Auth state is stable; roadmap state changes more frequently
  - Separation allows granular subscription updates in consuming components
  
- **Token in localStorage**: Enables session persistence across browser restarts without server-side sessions
  
- **Conditional Rendering**: AuthProvider wraps children only after `loading` completes to prevent race conditions where components render before auth state is ready
  
- **Manual Refresh Method**: AppContext exposes `refreshProgress()` to allow components to sync progress after session events (e.g., after completing a lesson) without full page reload

- **Single Active Roadmap**: AppContext assumes one active roadmap per user (simpler than multi-roadmap management; if multiple roadmaps needed, would require array state + selection logic)

## Data Flow

```
[On App Load]
  → Check localStorage for 'sm_token'
  → If exists: getMe() API
    ├─ Response: { user, hasRoadmap }
    └─ Update AuthContext state
  
[Once User Authenticated]
  → AppContext listens to user state change
  → Calls getActiveRoadmap() API
    ├─ Response: { roadmapId, roadmapJson, progress }
    └─ Update AppContext state

[Component Interaction]
  → useAuth() hook → get user, login, signup, logout actions
  → useApp() hook → get roadmapId, roadmapJson, progress + refreshProgress()
  → Component can call refreshProgress() after mutations
```

## Dependencies

### Depends On:
- `../api/auth.api.js` - `loginUser()`, `signupUser()`, `getMe()` for authentication
- `../api/roadmap.api.js` - `getActiveRoadmap()` for fetching active roadmap
- React built-ins - `createContext`, `useContext`, `useState`, `useEffect`

### Depended On By:
- `../hooks/useAuth.js` - Re-exports `useAuth` hook (optional wrapper)
- `../hooks/useApp.js` - Re-exports `useApp` hook (optional wrapper)
- All components via `useAuth()` and `useApp()` hooks
- `App.jsx` - Wraps app with both providers

## Common Mistakes / Gotchas

1. **Using AppContext before user is authenticated**: AppContext depends on AuthContext.user. Always nest `<AppProvider>` inside `<AuthProvider>`. If roadmapJson is null, check that user is authenticated first.

2. **Forgetting to call refreshProgress()**: Progress state is only fetched once on mount. Components that mutate progress (complete lesson, fail exam) must call `refreshProgress()` to see updates, or manually call `setRoadmapData()`.

3. **Mutating state objects directly**: Never mutate `roadmapJson` or `progress` objects directly. Always call `setRoadmapData()` or `refreshProgress()` to trigger re-renders in consuming components.

4. **Token expiration**: The code doesn't handle token refresh or expiration. If backend returns 401/403, the component making the API call must handle logout. Consider adding a global API interceptor.

5. **Memory leaks**: Both contexts fetch data on mount. Ensure cleanup if providers are conditionally rendered (current code is safe, but important for future modifications).

6. **Race conditions in signup flow**: After signup, `hasRoadmap` is set to `false` even if backend assigned one. Components should not rely on this field immediately; call `refreshProgress()` after navigation.

## Extension Points

### Adding a New Global State Value
1. Add state variable to the appropriate context (`AuthContext` or `AppContext`)
2. Add to the context Provider's `value` prop
3. Create or update a custom hook to expose it
4. Import and use in components via the hook

**Example**: To add user theme preference to AuthContext:
```javascript
const [theme, setTheme] = useState('light');
// Add to Provider value
// Create useTheme() hook that returns { theme, setTheme }
```

### Adding a New Context
1. Create new file: `NewContext.jsx`
2. Follow the same pattern: `createContext`, Provider component, custom hook
3. Ensure proper dependency ordering in `App.jsx` (auth must wrap app)
4. Document in this README

### Fetching New Data on Authentication
1. Add API call to `AuthContext.useEffect` in the `initAuth()` function
2. Store result in new state variable
3. Expose via value prop and custom hook
4. Alternative: Create new context if data is large or changes independently

