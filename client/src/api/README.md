# api

## Purpose
Service layer providing abstraction over HTTP communication with the backend, handling authentication, request/response formatting, error management, and endpoint organization.

## Responsibility Boundary
**Responsible for:**
- HTTP client configuration and initialization (Axios)
- Request interceptor logic (attaching auth token)
- Response interceptor logic (handling 401, redirects)
- API endpoint definitions as typed service functions
- Request/response payload transformation
- Error propagation

**NOT responsible for:**
- Backend logic or data validation rules
- Component state management or UI rendering
- Business logic (components decide what to do with responses)
- Caching strategies (each call is independent)
- Authentication decision-making (backend validates tokens)
- Form validation (components validate before calling API)

## Contents

| File | Type | Purpose |
|---|---|---|
| **axiosInstance.js** | Config | Configures Axios client with baseURL, request interceptor for tokens, response interceptor for 401 handling |
| **auth.api.js** | Service | Handles signup, login, and current user info retrieval |
| **progress.api.js** | Service | Handles progress advancement and stats retrieval |
| **roadmap.api.js** | Service | Handles roadmap generation and active roadmap fetching |
| **session.api.js** | Service | Handles session fetching, task submission, and exam submission |

## How It Works

**1. Axios Configuration & Initialization**
```
axiosInstance.js:
  - Validates VITE_API_URL environment variable exists
  - Creates Axios instance with baseURL
  - Adds request interceptor:
    • Retrieves token from localStorage (key: 'sm_token')
    • Attaches Authorization header if token exists
    • Passes modified config to request
  - Adds response interceptor:
    • On success: returns response as-is
    • On 401 error: clears token, redirects to /auth
    • On other errors: rejects with error
```

**2. Service Function Pattern**
```
Each service function follows the pattern:
  1. Import axiosInstance as 'api'
  2. Export async function (name reflects endpoint)
  3. Function signature: async (params) => { ... }
  4. Call api.get/post/put/delete with path and data
  5. Extract response.data and return
  6. Errors propagate naturally to caller
```

**3. Request Flow**
```
Component calls: getSession(dayId, roadmapId)
        ↓
service function: api.get(`/session/${dayId}`, { params: { roadmapId } })
        ↓
request interceptor: adds Authorization header from localStorage
        ↓
Axios sends HTTP GET to baseURL + endpoint path
        ↓
Backend receives request, processes, returns response
        ↓
response interceptor checks status:
  - 200-299: return response
  - 401: clear token, redirect to /auth
  - other: reject with error
        ↓
service function returns res.data to component
        ↓
Component handles success or error
```

**4. Authentication Headers**
```
Every request automatically gets:
  Authorization: Bearer <token_from_localStorage>

Token is:
  - Set by auth.api.js after login/signup
  - Stored in localStorage with key 'sm_token'
  - Cleared by axiosInstance when 401 occurs
  - Retrieved by request interceptor on every call
```

**5. Error Handling**
```
Component tries to call API:
        ↓
Service function returns Promise
        ↓
If network error: Promise rejects with error.code
If backend error: Promise rejects with error.response.status/data
If 401 specifically: response interceptor already handled (redirected to /auth)
        ↓
Component catches error in .catch() or try/catch
        ↓
Component decides what to do (show error UI, retry, etc.)
```

## Key Design Decisions

| Decision | Why | Alternative |
|---|---|---|
| **Separate service files** (`auth.api.js`, `session.api.js`, etc.) | Organizationally scalable; each file groups related endpoints; easier to test and mock; endpoint URLs in one place | All endpoints in one giant file, inline API calls in components |
| **axiosInstance pattern** | Single configuration point; interceptors apply globally; DRY principle; easy to swap implementations | Fetch API with manual header setup, different client per endpoint |
| **Request interceptor for tokens** | Automatic; no need to pass token to every function; adds to every request without thinking | Manual header setup in each function, session storage |
| **Response interceptor for 401** | Global error handling; consistent redirect across app; clears bad token immediately | Handle 401 in each component, custom middleware, HOC wrapper |
| **Token in localStorage** | Persists across page refreshes; simple to implement; readable for debugging | sessionStorage (lost on tab close), cookies (requires backend CSRF setup), IndexedDB |
| **Async/await pattern** | Modern, readable, easier error handling | Promise chains with .then()/.catch() |
| **Query params for optional data** | RESTful convention; GET requests shouldn't have body; params in object are encoded automatically | URL-encoded paths, POST for GET-like operations |
| **Service functions return res.data** | Cleaner component code; hide Axios response wrapper; payload is what matters | Return full response, let components extract .data |

## Data Flow

```
AUTHENTICATION FLOW:
  Input: { name, email, password } (from form)
    ↓
  signupUser(name, email, password)
    → axiosInstance.post('/auth/signup', { name, email, password })
    → request interceptor: (no token yet, so no header)
    → Backend validates, creates user, returns { token, user, hasRoadmap }
    ↓
  Output: { token, user, hasRoadmap }
    Component stores token in localStorage via AuthContext
    Axios future requests now include token in header

LOGIN FLOW:
  Input: { email, password } (from form)
    ↓
  loginUser(email, password)
    → axiosInstance.post('/auth/login', { email, password })
    → Backend validates credentials, returns { token, user, hasRoadmap }
    ↓
  Output: { token, user, hasRoadmap }
    Component stores token in localStorage

GET_ME FLOW (session restore):
  Input: token in localStorage
    ↓
  getMe()
    → request interceptor: adds Authorization: Bearer <token> header
    → axiosInstance.get('/auth/me')
    → Backend validates token, returns current user info
    ↓
  Output: { user, hasRoadmap }
    Restores user state on page refresh

ROADMAP FETCH FLOW:
  Input: user authenticated (token exists)
    ↓
  getActiveRoadmap()
    → request interceptor: adds Authorization header
    → axiosInstance.get('/roadmap/active')
    → Backend fetches user's roadmap from database
    ↓
  Output: { roadmapId, roadmapJson, progress }
    Component stores in AppContext

SESSION FETCH FLOW:
  Input: dayId, roadmapId from URL/state
    ↓
  getSession(dayId, roadmapId)
    → request interceptor: adds Authorization header
    → axiosInstance.get(`/session/${dayId}`, { params: { roadmapId } })
    → Backend generates or fetches session for day
    ↓
  Output: { session: { _id, dayId, type, content, status, ... } }
    Component renders LessonPhase/MiniExercise/TaskPhase based on type

TASK SUBMISSION FLOW:
  Input: dayId, { roadmapId, type, taskAnswer, mcqAnswers }
    ↓
  submitTask(dayId, payload)
    → request interceptor: adds Authorization header
    → axiosInstance.post(`/session/${dayId}/submit`, payload)
    → Backend evaluates answer using Gemini AI, returns feedback
    ↓
  Output: { feedback, outcome, score, passed }
    Component shows feedback to user

EXAM SUBMISSION FLOW:
  Input: dayId, { roadmapId, answers: [{ questionIndex, selectedIndex }, ...] }
    ↓
  submitExam(dayId, payload)
    → request interceptor: adds Authorization header
    → axiosInstance.post(`/session/${dayId}/exam`, payload)
    → Backend evaluates all answers, calculates score, identifies weak topics
    ↓
  Output: { score, passed, feedback, weakTopics, nextAction }
    Component shows exam results

PROGRESS ADVANCE FLOW:
  Input: roadmapId, dayId, status ("pass" | "incomplete")
    ↓
  advanceProgress(roadmapId, dayId, status)
    → request interceptor: adds Authorization header
    → axiosInstance.post('/progress/advance', payload)
    → Backend updates user's progress in database
    ↓
  Output: { success, newProgress, ... }
    Component refreshes progress in AppContext

STATS FETCH FLOW:
  Input: roadmapId from AppContext
    ↓
  getStats(roadmapId)
    → request interceptor: adds Authorization header
    → axiosInstance.get('/progress/stats', { params: { roadmapId } })
    → Backend aggregates user's completion stats, badges, streaks
    ↓
  Output: { completionRate, badges, currentStreak, ... }
    Component renders on ProgressPage
```

## Dependencies

### Depends On:
- **axios** - HTTP client library for making requests
- **localStorage** (browser API) - Stores JWT token for persistence
- **VITE_API_URL** (environment variable) - Base URL for all API requests
- **Backend API** - All endpoints called via this service layer

### Depended On By:
- **AuthContext** (`context/AuthContext.jsx`) - Uses `loginUser()`, `signupUser()`, `getMe()`
- **AppContext** (`context/AppContext.jsx`) - Uses `getActiveRoadmap()`
- **Pages** - SessionPage uses `getSession()`, `submitTask()`, `submitExam()`
- **Pages** - ProgressPage uses `getStats()`, `advanceProgress()`
- **Pages** - SetupPage uses `generateRoadmap()`

## Common Mistakes / Gotchas

1. **Forgetting VITE_API_URL environment variable** - App crashes on load if not set. Define in `.env` or CI/CD: `VITE_API_URL=http://localhost:3000`

2. **Calling API before token exists** - First request has no Authorization header. This is OK for signup/login, but other endpoints will fail. Always check `user` exists in AuthContext first.

3. **Not catching errors from service functions** - Errors propagate to caller; if not caught, causes unhandled Promise rejection. Always use try/catch or .catch() in components.

4. **Modifying token directly in localStorage** - Token key must match `'sm_token'` everywhere. Use utils/tokenHelpers.js functions instead of localStorage directly.

5. **Making multiple API calls in parallel without dependency** - Can cause race conditions on progress updates. If calls depend on each other, await first call before second.

6. **Not handling 401 redirects** - Response interceptor redirects automatically, but if you remove it or create a new Axios instance, 401 errors break silently.

7. **Passing undefined or null in query params** - Axios encodes undefined as empty string in URL. Check params are defined before passing: `{ params: roadmapId ? { roadmapId } : {} }`

8. **Breaking interceptor chain** - If interceptor doesn't return config or response, subsequent interceptors fail. Always return the value from interceptor functions.

9. **Using service functions outside provider tree** - If called before AuthProvider mounts or token is set, requests have no token. Always call from components inside provider tree.

10. **Storing complex objects in response** - Service functions return res.data which may have nested objects, functions, etc. Only access properties you know exist; handle missing data gracefully.

11. **Not handling network errors** - If backend is down, error.response is undefined. Check error.code for network errors: `if (error.code === 'ERR_NETWORK') { ... }`

12. **Assuming response shape matches backend** - Backend contract can change; frontend will break. Always document expected response shape in JSDoc comments.

## Extension Points

### Adding a New API Endpoint

1. **Create a new service file** in `api/` folder (e.g., `stats.api.js`):
   ```js
   import api from './axiosInstance';
   
   /**
    * Brief description of what this endpoint does.
    * HTTP_METHOD /endpoint/path
    * 
    * @param {type} paramName - Description
    * @returns {object} { field1, field2, ... }
    */
   export const functionName = async (paramName) => {
     const res = await api.get('/endpoint/path', { params: { paramName } });
     return res.data;
   };
   ```

2. **Import in component** where you need it:
   ```js
   import { functionName } from '../api/stats.api';
   ```

3. **Call in useEffect**:
   ```js
   useEffect(() => {
     functionName(param)
       .then(data => setData(data))
       .catch(err => setError(err.message));
   }, [param]);
   ```

### Adding Multiple Related Endpoints

1. Group them in the same service file:
   ```js
   export const getStats = async (roadmapId) => { ... };
   export const updateStats = async (roadmapId, data) => { ... };
   export const deleteStats = async (roadmapId) => { ... };
   ```

### Modifying Request Format

1. **If backend changes endpoint path**:
   - Update the path in service function: `api.get('/new/path')`
   - No component changes needed

2. **If backend changes request payload shape**:
   - Update service function signature and payload construction
   - Update JSDoc comment
   - Update all call sites in components

3. **If adding a new request header** (e.g., API key, custom version header):
   - Add to request interceptor in `axiosInstance.js`:
     ```js
     api.interceptors.request.use((config) => {
       config.headers['X-Custom-Header'] = 'value';
       return config;
     });
     ```

### Handling New Error Types

1. **Add error type check in response interceptor**:
   ```js
   api.interceptors.response.use(
     (response) => response,
     (error) => {
       if (error.response?.status === 401) { ... }
       if (error.response?.status === 403) {
         // Handle forbidden
       }
       return Promise.reject(error);
     }
   );
   ```

2. **Or handle in components**:
   ```js
   try {
     const data = await getSession(dayId, roadmapId);
   } catch (error) {
     if (error.response?.status === 404) {
       setError('Session not found');
     }
   }
   ```

### Testing API Services

1. **Mock axiosInstance** in test file:
   ```js
   jest.mock('./axiosInstance', () => ({
     get: jest.fn(),
     post: jest.fn(),
   }));
   ```

2. **Test service function**:
   ```js
   test('getStats calls correct endpoint', async () => {
     api.get.mockResolvedValue({ data: { stats: {...} } });
     const result = await getStats('roadmapId123');
     expect(api.get).toHaveBeenCalledWith('/progress/stats', { params: { roadmapId: 'roadmapId123' } });
     expect(result).toEqual({ stats: {...} });
   });
   ```
