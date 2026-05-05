# Routes

## Purpose
Implements authentication guards for protected routes, ensuring only authenticated users can access pages beyond login and that the application restores state consistently during page reloads.

## Responsibility Boundary
**Responsible for:**
- Protecting routes that require authentication (all pages except /auth and /404)
- Checking auth state before rendering protected pages
- Handling loading states during auth initialization
- Providing fallback behavior when user is not authenticated

**NOT responsible for:**
- Defining route paths or structure (that's in App.jsx or router configuration)
- Managing authentication state (that's in AuthContext)
- Managing app-level state (that's in AppContext)
- Page implementations themselves (that's in `/pages`)

## Contents

| File | Type | Purpose |
|------|------|---------|
| **ProtectedRoute.jsx** | Route Component | Wrapper that enforces authentication before rendering child routes |

## How It Works

### ProtectedRoute: Authentication Guard

**Purpose:** Wraps protected routes in the router to prevent unauthenticated access.

**Typical usage in App.jsx or router config:**
```jsx
import ProtectedRoute from './routes/ProtectedRoute';

<Routes>
  <Route path="/auth" element={<AuthPage />} />
  
  {/* Protected routes */}
  <Route element={<ProtectedRoute />}>
    <Route path="/learn" element={<LearnPage />} />
    <Route path="/roadmap" element={<RoadmapPage />} />
    <Route path="/setup" element={<SetupPage />} />
    <Route path="/progress" element={<ProgressPage />} />
    <Route path="/session/:dayId" element={<SessionPage />} />
  </Route>
  
  <Route path="*" element={<NotFoundPage />} />
</Routes>
```

### ProtectedRoute Behavior

**Three states:**

1. **Auth still initializing (`loading === true`)**
   ```
   Show full-screen LoadingSpinner
   Message: "Loading authentication..."
   ```
   Purpose: Prevent flash of /auth page during initial token check on reload

2. **Auth complete, user not found (`!loading && !user`)**
   ```
   Redirect to /auth using <Navigate to="/auth" replace />
   ```
   Purpose: Unauthenticated users cannot access protected pages

3. **Auth complete, user exists, app state restored (`!loading && user && !isRestoring`)**
   ```
   Render <Outlet /> (child routes)
   ```
   Purpose: User can access protected pages

4. **App restoring state from localStorage (`isRestoring === true`)**
   ```
   Show full-screen LoadingSpinner on dark background
   ```
   Purpose: While AppContext reloads roadmap data on page refresh, prevent UI interaction

### State Flow Diagram

```
User loads /learn
    ↓
ProtectedRoute mounts
    ↓
Check: is AuthContext.loading?
  ├─ YES → Show spinner
  │
  └─ NO → Check: is user null?
       ├─ YES → Navigate to /auth
       │
       └─ NO → Check: is AppContext.isRestoring?
            ├─ YES → Show spinner
            │
            └─ NO → Render <Outlet /> → child page loads
```

### Code Walkthrough

```jsx
export default function ProtectedRoute() {
  const { user, loading } = useAuth();        // Auth initialization state
  const { isRestoring } = useApp();           // App state restoration

  // GUARD 1: Auth still loading → spinner
  if (loading) {
    return <LoadingSpinner />;
  }

  // GUARD 2: Auth done, user missing → redirect to /auth
  if (!loading && !user) return <Navigate to="/auth" replace />;
  
  // GUARD 3: App restoring state → spinner
  if (isRestoring) {
    return <LoadingSpinner />;
  }

  // PASS: All checks pass → render protected child routes
  return <Outlet />;
}
```

**Key: `<Outlet />`** — React Router component that renders the matched child route

## Key Design Decisions

### 1. **Single wrapper component (vs. individual route guards)**
**Decision:** ProtectedRoute is a single wrapper component that protects all nested routes at once, not individual guards on each route.

**Why:** DRY principle. One place to manage auth logic. All protected routes use same guard. Easier to update guard logic without touching route definitions.

**Alternative considered:** Guard logic in each page component. Verbose, error-prone, inconsistent.

### 2. **Two loading states (auth loading vs. app restoring)**
**Decision:** Separate `loading` (auth initialization) and `isRestoring` (app state reload) into two distinct checks.

**Why:** 
- `loading` → checking if user token is valid, checking with backend
- `isRestoring` → after user confirmed, reloading roadmap/progress from API

Different purposes require different spinners and timing. Prevents user from interacting while either operation is in flight.

**Alternative considered:** Single loading flag. Would mask both operations under one boolean.

### 3. **Navigate with `replace` prop**
**Decision:** When redirecting unauthenticated user to /auth, use `<Navigate to="/auth" replace />`

**Why:** `replace` removes the protected route from browser history. User clicks back from /auth, goes to wherever they were before (not to the protected route). Prevents navigation loop.

**Alternative considered:** Without `replace`. User could navigate back to protected route, see flash of it before redirect.

### 4. **Dark background during app restore**
**Decision:** `isRestoring` spinner uses `bg-navy` (dark) background, while `loading` uses `bg-gray-50 dark:bg-navy` (respects theme).

**Why:** App restore happens post-authentication, post-theme load. Can safely assume dark mode is ready. Provides stronger visual signal that app is "almost ready".

**Alternative considered:** Consistent styling. Less visual distinction.

## Data Flow

```
[Page Load / Reload]
Browser requests /learn (or any protected route)
    ↓
React Router matches ProtectedRoute element
    ↓
ProtectedRoute component mounts
    ↓
useAuth() hook reads:
  - loading: true (AuthContext init in progress)
  - user: null (not yet known)
    ↓
Render loading spinner
    ↓
[Parallel: AuthContext initialization]
useEffect in AuthContext:
  - Read localStorage for 'sm_token'
  - If token exists: call getMe() API
  - Receive user data or error
  - setLoading(false)
    ↓
ProtectedRoute re-renders:
  - loading: false
  - user: { name, email, ... } (found)
    ↓
Check isRestoring (AppContext init):
  - AppContext useEffect triggered
  - Loading roadmap from API
  - setIsRestoring(true) while loading
    ↓
ProtectedRoute renders loading spinner again
    ↓
[App state loads]
AppContext receives roadmapId, roadmapJson, progress
    ↓
AppContext setIsRestoring(false)
    ↓
ProtectedRoute re-renders:
  - loading: false
  - user: {...}
  - isRestoring: false
    ↓
Render <Outlet /> → LearnPage mounts
```

## Dependencies

### Depends On:
- `react-router-dom` — Navigate, Outlet components for routing
- `../hooks/useAuth` — Access authentication state and loading flag
- `../hooks/useApp` — Access app restoration state
- `../components/ui/LoadingSpinner` — Loading indicator UI

### Depended On By:
- App.jsx or router configuration — Wraps protected routes
- All protected pages (LearnPage, RoadmapPage, etc.) — Protected by this component

## Common Mistakes / Gotchas

1. **Forgetting `replace` on Navigate**
   - ❌ Don't: `<Navigate to="/auth" />`  (user can back-navigate to protected route)
   - ✅ Do: `<Navigate to="/auth" replace />`  (removes protected route from history)

2. **Not checking both loading and user**
   - ❌ Don't: `if (loading) return <Spinner />; if (!user) return <Navigate ...;`  (if loading is false and user is null, both conditions fire)
   - ✅ Do: `if (loading) return ...; if (!loading && !user) return ...;`  (explicit ordering)

3. **Missing isRestoring check**
   - ❌ Issue: Page renders before AppContext finishes loading roadmap. Users see empty state briefly
   - ✅ Do: Check isRestoring and show spinner until all context data is ready

4. **Wrong loading state condition**
   - ❌ Don't: `if (!loading)` to show protected content (also shows if loading just started)
   - ✅ Do: `if (!loading && user && !isRestoring)` (all conditions must be true)

5. **Rendering Outlet without guards**
   - ❌ Don't: Always render `<Outlet />` regardless of auth state
   - ✅ Do: Render `<Outlet />` only after passing all guards

6. **Showing sensitive data in loading spinner**
   - ❌ Issue: If loading spinner somehow displays user data before auth check
   - ✅ Do: Loading spinners should be self-contained, no external data

7. **Not handling token expiration**
   - ❌ Issue: User logs in, token expires during session, page still shows as protected
   - ✅ Do: (Currently handled in API layer with axios interceptor; ensure errors trigger re-auth)

## Extension Points

### Adding Additional Route Types (Admin Routes)

Create a new route guard for admin pages:

```jsx
// routes/AdminRoute.jsx
export default function AdminRoute() {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!loading && !user) return <Navigate to="/auth" replace />;
  if (user.role !== 'admin') return <Navigate to="/learn" replace />;
  
  return <Outlet />;
}

// Usage in App.jsx
<Route element={<AdminRoute />}>
  <Route path="/admin/dashboard" element={<AdminDashboard />} />
</Route>
```

### Adding Route-Level Permissions

Extend ProtectedRoute to check specific permissions:

```jsx
export default function ProtectedRoute({ requiredRole }) {
  const { user, loading } = useAuth();
  const { isRestoring } = useApp();
  
  if (loading || isRestoring) return <LoadingSpinner />;
  if (!user) return <Navigate to="/auth" replace />;
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/learn" replace />;
  }
  
  return <Outlet />;
}
```

### Adding Pre-Route Validation (Analytics)

Wrap ProtectedRoute to track route access:

```jsx
export default function ProtectedRouteWithTracking() {
  useEffect(() => {
    console.log('Entering protected route');
    return () => console.log('Leaving protected route');
  }, []);
  
  return <ProtectedRoute />;
}
```

### Handling Token Refresh

If implementing token refresh on route guard:

```jsx
useEffect(() => {
  if (token && isTokenExpiringSoon(token)) {
    refreshToken().catch(() => navigate('/auth'));
  }
}, []);
```

(Currently handled in axios interceptor; this is optional if additional refresh is needed)

