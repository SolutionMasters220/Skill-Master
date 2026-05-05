# Utils

## Purpose
Provides shared, reusable utility functions for common operations: authentication token management, form validation, and session state parsing.

## Responsibility Boundary
**Responsible for:**
- Pure functions with no side effects (except localStorage access)
- Validation logic for user inputs
- Token persistence and retrieval from localStorage
- Session ID parsing and building
- Session state derivation from roadmap data

**NOT responsible for:**
- API calls (those are in `/api`)
- React context or hooks (those are in `/context` and `/hooks`)
- Component logic or state management (that's in components/pages)
- Complex business logic (that's in services or context)

## Contents

| File | Purpose |
|------|---------|
| **tokenHelpers.js** | JWT token persistence (save, retrieve, clear) with localStorage |
| **validators.js** | Form field validation (email, password, name) with descriptive errors |
| **sessionHelpers.js** | Session ID parsing/building and current session derivation from roadmap |

## How It Works

### tokenHelpers.js: Token Lifecycle

**Three functions for JWT management:**

```javascript
saveToken(token)      // Write token to localStorage["sm_token"]
getToken()            // Read token from localStorage["sm_token"]
clearToken()          // Delete token from localStorage["sm_token"]
```

**Usage pattern:**

```javascript
// After successful login
const { token, user } = await loginUser(email, password);
saveToken(token);  // Persist for next reload

// When user returns (page load)
const token = getToken();
if (token) {
  const user = await validateToken(token);  // Check if still valid
  setUser(user);
}

// On logout
clearToken();  // Delete token
```

**Why localStorage?**
- Persists across browser reloads
- Accessible to all tabs/windows
- Simple key-value interface
- Token automatically sent by axios interceptor to all API calls

**Limitations:**
- Vulnerable to XSS attacks (mitigated by Content Security Policy)
- Lost on browser cache clear
- Not accessible in Service Workers (if implementing offline)

### validators.js: Form Validation

**Five validator functions, each returns `null` (valid) or error message (string):**

#### 1. validateEmail(email)
```javascript
validateEmail("user@example.com")    → null (valid)
validateEmail("")                    → "Email is required"
validateEmail("not-an-email")        → "Enter a valid email address..."
```

**Rules:**
- Required field
- RFC 5322 compliant regex: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
- Allows: alphanumerics, dots, underscores, hyphens, plus signs
- Requires: @ and domain with TLD

#### 2. validatePassword(password)
```javascript
validatePassword("weak")             → "Password must be at least 8 characters long"
validatePassword("Weak1!")           → null (valid, 8+ chars, upper, lower, digit, special)
validatePassword("NoSpecial123")     → "Password must contain at least one special character..."
```

**Rules (all required):**
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one digit (0-9)
- At least one special character (@$!%*?&)

**Design intent:** Enforce strong passwords to resist brute force attacks. Special character requirement reduces common patterns.

#### 3. validateConfirmPassword(password, confirmPassword)
```javascript
validateConfirmPassword("Pass123!", "Pass123!")    → null (valid)
validateConfirmPassword("Pass123!", "Pass124!")    → "Passwords do not match"
validateConfirmPassword("Pass123!", "")            → "Please confirm your password"
```

**Rules:**
- Both fields required
- Must match exactly (case-sensitive)

#### 4. validateName(name)
```javascript
validateName("John Doe")             → null (valid)
validateName("John")                 → "Please enter your full name (First and Last name)"
validateName("J Doe")                → "Each part of your name must be at least 2 characters"
validateName("")                     → "Full name is required"
```

**Rules:**
- Required field
- Minimum 2 parts (first + last name)
- Each part minimum 2 characters
- Whitespace trimmed

#### 5. validateRequired(value, label)
```javascript
validateRequired("text", "Username")  → null (valid)
validateRequired("", "Username")      → "Username is required"
validateRequired(null, "Username")    → "Username is required"
```

**Generic validator for any required field.**

**Usage in forms:**

```jsx
const [email, setEmail] = useState("");
const [error, setError] = useState(null);

const handleSubmit = (e) => {
  e.preventDefault();
  const err = validateEmail(email);
  if (err) {
    setError(err);
    return;
  }
  // Proceed with API call
};

return (
  <form onSubmit={handleSubmit}>
    <input value={email} onChange={(e) => setEmail(e.target.value)} />
    {error && <p className="text-fail">{error}</p>}
    <button type="submit">Submit</button>
  </form>
);
```

### sessionHelpers.js: Session State Parsing

**Three functions for working with session IDs and roadmap structure:**

#### 1. parseDayId(dayId)
```javascript
parseDayId("m1-w2-d3")
  → { moduleNumber: 1, weekNumber: 2, dayNumber: 3 }

parseDayId("m0-w0-d0")
  → { moduleNumber: 0, weekNumber: 0, dayNumber: 0 }

parseDayId(null)
  → { moduleNumber: 0, weekNumber: 0, dayNumber: 0 }
```

**Format:** `m{moduleNumber}-w{weekNumber}-d{dayNumber}`

**Why strings?** URL parameter in `/session/:dayId` must be string. Parsing extracts numeric components for roadmap lookup.

#### 2. buildDayId(moduleNumber, weekNumber, dayNumber)
```javascript
buildDayId(1, 2, 3)        → "m1-w2-d3"
buildDayId(0, 0, 0)        → "m0-w0-d0"
```

**Inverse of parseDayId.** Constructs dayId for navigation.

#### 3. getCurrentSession(roadmapJson, progress)

**Most complex function.** Derives current session object from roadmap structure using progress tracker.

```javascript
// Inputs:
roadmapJson = {
  skillName: "React",
  modules: [
    {
      moduleNumber: 1,
      title: "Basics",
      weeks: [
        {
          weekNumber: 1,
          title: "Week 1",
          days: [
            {
              dayNumber: 1,
              dayName: "Monday",
              title: "Introduction",
              type: "Lesson",
              ...
            }
          ]
        }
      ]
    }
  ]
}

progress = {
  currentModule: 1,
  currentWeek: 1,
  currentDay: "Monday",
  ...
}

// Output:
getCurrentSession(roadmapJson, progress)
  → {
      dayNumber: 1,
      dayName: "Monday",
      title: "Introduction",
      type: "Lesson",
      dayId: "m1-w1-d1",
      moduleNumber: 1,
      weekNumber: 1,
      moduleTitle: "Basics",
      ...
    }
```

**What it does:**
1. Extract `currentModule`, `currentWeek`, `currentDay` from progress
2. Find matching module by `moduleNumber`
3. Find matching week by `weekNumber`
4. Find matching day by `dayName` (string comparison)
5. Build dayId
6. Merge day data with module/week context

**Return value:** Complete session object with all necessary info, or null if any lookup fails

**Error handling:** Returns null if:
- roadmapJson is missing
- progress is missing
- Module not found
- Week not found
- Day not found

**Used by:** LearnPage to display current session, construct session card

## Key Design Decisions

### 1. **Validators return error messages, not boolean**
**Decision:** `validateEmail("test")` returns `"Enter a valid email address..."`, not `false`.

**Why:** UI can display error directly without needing separate error messages. Developers know immediately what's wrong.

**Alternative considered:** Return boolean. Would require mapping errors to messages elsewhere (duplication).

### 2. **validatePassword enforces special characters**
**Decision:** Require @$!%*?& in passwords.

**Why:** Common requirements in security standards. Reduces common patterns (sequential keyboards, dictionary words). OWASP-aligned.

**Alternative considered:** No special char requirement. Weaker security.

### 3. **validateName requires 2+ parts, each 2+ chars**
**Decision:** "John Doe" valid, "J D" invalid (parts too short), "John" invalid (only 1 part).

**Why:** Prevents single names. Most systems require first + last name. Prevents very short parts (initials only).

**Alternative considered:** Any non-empty string. Too permissive.

### 4. **parseDayId/buildDayId format: m{X}-w{X}-d{X}**
**Decision:** URL format is `m1-w1-d1` (module 1, week 1, day 1).

**Why:** 
- Human readable in URL bar
- Unambiguous parsing (no confusion about order)
- Compact
- Prefix (m, w, d) makes order clear

**Alternative considered:** 
- JSON format in URL: too long
- Just numbers: ambiguous (123 = 1-2-3 or 12-3?)
- Slash separated: conflicts with path syntax

### 5. **getCurrentSession returns null on any lookup failure**
**Decision:** If module/week/day not found, return null (not throw error).

**Why:** Graceful handling. Calling code can check `if (!session) return <EmptyState />`. Prevents crashes from malformed data.

**Alternative considered:** Throw error. Would require try/catch everywhere.

### 6. **Token stored in localStorage with key "sm_token"**
**Decision:** Key is `"sm_token"` (prefixed with app acronym).

**Why:** Namespace conflicts. Multiple apps on same domain won't overwrite each other's tokens.

**Alternative considered:** Just `"token"`. Too generic, could conflict.

## Data Flow

### Token Flow
```
[Login]
User submits credentials
    ↓
POST /auth/login
    ↓
Response: { token: "eyJhb...", user: {...} }
    ↓
saveToken(token)  → localStorage["sm_token"] = "eyJhb..."
    ↓
[Page Reload]
AuthContext useEffect runs
    ↓
getToken()  → reads localStorage["sm_token"]
    ↓
If token exists: POST /auth/me (include token in header)
    ↓
Response: { user: {...} }  or error (token expired/invalid)
    ↓
setUser() or clearToken() + redirect
```

### Validation Flow
```
[Form Submission]
User enters email, password
    ↓
handleSubmit() {
  const emailErr = validateEmail(email);
  const passErr = validatePassword(password);
  
  if (emailErr || passErr) {
    setErrors({ email: emailErr, password: passErr });
    return;  // Don't submit
  }
  
  // All valid, proceed to API call
  loginUser(email, password);
}
    ↓
User sees form errors inline, fixes them, resubmits
```

### Session Derivation Flow
```
[Page Load]
User navigates to /learn
    ↓
LearnPage mounts
    ↓
useApp() returns { roadmapJson, progress }
    ↓
useEffect(() => {
  const session = getCurrentSession(roadmapJson, progress);
  if (!session) return <EmptyState />;
  
  // Render session card with session.title, session.type, etc.
}, [roadmapJson, progress])
    ↓
Session displayed on dashboard
```

## Dependencies

### Depends On:
- JavaScript built-ins only (`localStorage`, regex, string methods)
- No external libraries
- No React

### Depended On By:
- AuthContext — Uses tokenHelpers for JWT persistence
- AuthPage — Uses validators for form validation
- SetupPage — Uses validators for questionnaire validation
- LearnPage — Uses sessionHelpers to display current session
- API layer — Uses getToken() to include JWT in requests

## Common Mistakes / Gotchas

1. **Forgetting to check validator return value**
   - ❌ Don't: `validateEmail(email); submitForm();`  (ignores error)
   - ✅ Do: `if (validateEmail(email)) { setError(...); return; }`

2. **Calling getToken() assuming it exists**
   - ❌ Don't: `const token = getToken(); fetch(..., { headers: { auth: token } })`  (crashes if null)
   - ✅ Do: `const token = getToken(); if (!token) redirect('/auth');`

3. **Modifying returned objects from helpers**
   - ❌ Issue: `getCurrentSession()` returns week object; if caller modifies it, roadmap is corrupted
   - ✅ Do: Helpers return data; pages shouldn't mutate them. If needed to update, use context methods.

4. **Validator logic diverging from backend**
   - ❌ Issue: Client validates password as valid, server rejects it with different rules
   - ✅ Do: Keep validators in sync with backend validation rules (document expected format)

5. **dayId format mismatch in URL vs. code**
   - ❌ Issue: URL has `/session/1-2-3` but code expects `m1-w2-d3`
   - ✅ Do: Always use parseDayId() and buildDayId() for consistency

6. **getCurrentSession called before roadmapJson loads**
   - ❌ Don't: `getCurrentSession(roadmapJson, progress)` before roadmapLoading is false
   - ✅ Do: `if (roadmapLoading) return <Spinner />; const session = getCurrentSession(...);`

7. **Token cleared but user state not cleared**
   - ❌ Issue: clearToken() called, but user object still in context
   - ✅ Do: When token is cleared, also call `setUser(null)` in context

8. **Password stored in component state after validation**
   - ❌ Issue: Password string remains in state after form submission (security risk)
   - ✅ Do: Clear password from state after successful submission, or don't store it unnecessarily

## Extension Points

### Adding New Validators

```javascript
// utils/validators.js
export const validateUsername = (username) => {
  if (!username) return "Username is required";
  if (username.length < 3) return "Username must be at least 3 characters";
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return "Username can only contain letters, numbers, and underscores";
  }
  return null;
};
```

Then import and use in forms:

```jsx
const err = validateUsername(username);
if (err) setError(err);
```

### Adding Token Refresh Logic

```javascript
// utils/tokenHelpers.js
export const shouldRefreshToken = (token) => {
  const payload = JSON.parse(atob(token.split('.')[1]));
  const expiresAt = payload.exp * 1000;
  const now = Date.now();
  return expiresAt - now < 60000;  // Refresh if expires in <1 min
};

// Usage in AuthContext
if (token && shouldRefreshToken(token)) {
  const newToken = await refreshToken();
  saveToken(newToken);
}
```

### Adding Session Caching

```javascript
// Cache parsed dayIds to avoid re-parsing on every render
const dayIdCache = new Map();

export const parseDayIdCached = (dayId) => {
  if (!dayIdCache.has(dayId)) {
    dayIdCache.set(dayId, parseDayId(dayId));
  }
  return dayIdCache.get(dayId);
};
```

### Adding Stronger Validation Rules

```javascript
// Add optional strict mode
export const validateEmail = (email, strict = false) => {
  if (!email) return "Email is required";
  const regex = strict
    ? /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/  // RFC 5322
    : /^[^\s@]+@[^\s@]+\.[^\s@]+$/;  // Simpler
  if (!regex.test(email)) return "Enter a valid email address";
  return null;
};
```

### Internationalization (i18n) Support

```javascript
// Pass language code or use i18n library
export const validateEmail = (email, lang = 'en') => {
  if (!email) return i18n.t('errors.emailRequired', lang);
  // ... rest of validation
};
```

