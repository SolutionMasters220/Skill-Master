# components

## Purpose
Provides reusable UI building blocks and layout shells that structure the application interface, separated into layout containers (page structure) and UI primitives (interactive elements).

## Responsibility Boundary
**Responsible for:**
- Reusable component composition and rendering
- Styling consistency across the app (Tailwind classes)
- Responsive layout behavior (mobile vs desktop)
- Accessibility and user interaction patterns
- Dark mode theming through CSS classes

**NOT responsible for:**
- Business logic or state management (passed via props)
- API communication (handled by parent pages/contexts)
- Navigation routing (handled by React Router)
- Form validation (handled by pages)
- Data transformation or processing

## Contents

### Layout Components (`layout/`)

| File | Purpose |
|---|---|
| **AppShell.jsx** | Root layout wrapper for authenticated pages; provides viewport layout with Navbar, content area, Footer, and BottomTabBar |
| **Navbar.jsx** | Desktop header; displays logo, navigation links, theme toggle, and profile dropdown |
| **BottomTabBar.jsx** | Mobile navigation; shows tab icons for Home, Roadmap, Progress with active indicators |
| **Footer.jsx** | Desktop footer; shows skill name, current module/week/day info (hidden on mobile) |
| **ProfileDropdown.jsx** | User profile menu; displays user initials, shows logout option on click |

### UI Components (`ui/`)

| File | Purpose |
|---|---|
| **Button.jsx** | Interactive button with variants (primary, secondary, ghost, danger), sizes (sm, md, lg), and loading state |
| **Card.jsx** | Container with rounded border and shadow; supports clickable variant with hover effects |
| **Badge.jsx** | Status badge with variants for learning states (learning, revision, exam, passed, failed, locked) |
| **LoadingSpinner.jsx** | Animated spinner indicator; sizes: sm (4x4), md (5x5), lg (8x8) |
| **StatCard.jsx** | Statistics display card showing label, value, and optional value color |
| **PillOption.jsx** | Toggleable pill-shaped button for single/multiple selection; shows selected/unselected states |
| **ErrorBoundary.jsx** | React Error Boundary; catches rendering errors and displays fallback UI with retry option |

## How It Works

### Layout Hierarchy
```
App (from src/App.jsx)
  ├── ProtectedRoute (checks auth)
  │   └── AppShell (layout wrapper)
  │       ├── Navbar (top fixed header)
  │       │   ├── Logo
  │       │   ├── NavLinks (desktop only)
  │       │   ├── Theme Toggle
  │       │   └── ProfileDropdown
  │       ├── Main Content Area (scrollable)
  │       │   └── ErrorBoundary
  │       │       └── <Outlet /> (current page)
  │       ├── Footer (desktop only, hidden md:)
  │       └── BottomTabBar (mobile only, md:hidden)
```

### Component Usage Pattern
```
1. Page component imports primitive UI components (Button, Card, Badge)
2. Page passes data via props to components
3. Component renders with Tailwind classes
4. User interacts via onClick handlers
5. Page listens to handler callbacks, updates state
6. Component re-renders with new props
```

### Responsive Design
```
Mobile-first approach:
  - Components render for mobile by default
  - Navbar uses full width, responsive spacing
  - BottomTabBar visible, used for primary navigation
  - Footer hidden (md:hidden class)
  - Screens < 768px show mobile layout

Desktop (md: breakpoint):
  - Navbar shows desktop nav links (hidden md:flex)
  - BottomTabBar hidden (md:hidden)
  - Footer visible, shows detailed info
  - Wider spacing, multi-column layouts available
```

### State Management in Components
```
Two types:

Local State (component manages):
  - ProfileDropdown: open/closed state
  - Button: loading state (from props)
  - ErrorBoundary: error state

Received via Props:
  - All data passed from parent
  - Handlers for onClick/onChange
  - No direct context access (keeps components pure)
```

### Dark Mode Implementation
```
1. useTheme() hook in Navbar toggles dark class on document
2. Tailwind darkMode: "class" config watches document class
3. All components use dark: prefix for dark mode styles
4. Custom colors defined in tailwind.config.js:
   - navy (#0F1923) - dark background
   - accent (#38BDF8) - primary action
   - pass (#22C55E) - success states
   - fail (#EF4444) - error states
```

### Error Handling Flow
```
React rendering error occurs in page component
  ↓
ErrorBoundary (wrapping component content) catches it
  ↓
getDerivedStateFromError: sets hasError = true
  ↓
componentDidCatch: logs error (can send to service)
  ↓
Renders fallback UI: error icon + message + retry button
  ↓
User clicks "Try Again": page refreshes or parent navigates
  ↓
AppShell preserved (nav/footer still visible)
```

## Key Design Decisions

| Decision | Why | Alternative |
|---|---|---|
| **Separate layout/ and ui/** | Separation of concerns: layout are page containers, ui are primitives; easier to maintain and test | Single components/ folder, monolithic structure |
| **Props-only components** | No context/state logic; pure, testable, reusable; data flows down, events flow up | Components access context directly, HOCs with logic |
| **Tailwind for styling** | Utility-first; atomic, predictable classes; dark mode support; performance; no CSS file duplication | CSS modules, styled-components, inline styles |
| **Custom colors in Tailwind config** | Single source of truth for design system; easy to theme globally; consistent across app | Inline hex codes, CSS variables, scattered color values |
| **ErrorBoundary as class component** | Class components have getDerivedStateFromError hook; functional components can't catch errors yet | Functional components, router-level error handling |
| **ProfileDropdown click-outside handling** | Closes menu when clicking outside; improves UX; prevents menu from staying open | Close on blur, always visible, click again to close |
| **Badge variants** | Explicit variants (learning, exam, passed, failed) match business domain; self-documenting | Generic color props, theme props, magic strings |
| **Button variants + sizes** | Consistent sizing across app; variants match UI patterns (primary/secondary/danger) | Props for color/size, inline className, no system |
| **StatCard styling** | Predefined layout for metric display; consistent with design system; prevents inline styling chaos | Props-based styling, raw HTML |
| **LoadingSpinner with sizes** | Consistent spinner usage across components (inline spinners, page loaders, button loaders) | Different spinner per use case, CSS animations |
| **Responsive nav (desktop Navbar, mobile BottomTabBar)** | Each platform gets optimized UX; mobile scrolls, desktop shows links; avoids menu complexity | Single nav for all, hamburger menu, always visible |

## Data Flow

```
LAYOUT FLOW:
  App loads authenticated user
    ↓
  AppShell renders (fixed structure)
    ├── Navbar: shows user name, link to pages (desktop), theme toggle
    ├── Main: renders page via <Outlet />
    ├── Footer: shows skill name + progress (desktop only)
    └── BottomTabBar: shows tabs (mobile only)
    ↓
  User navigates via link → Router updates URL → page re-renders

BUTTON INTERACTION:
  Parent passes: variant, size, disabled, onClick, children
    ↓
  Button renders with Tailwind classes
    ↓
  User clicks button
    ↓
  onClick handler fired (passed to parent)
    ↓
  Parent handles event (submit form, navigate, etc.)

CARD INTERACTION:
  Parent passes: children, onClick, className
    ↓
  Card renders wrapper div with shadow/border
    ↓
  If onClick provided: add hover effects (shadow-xl, -translate-y-1)
    ↓
  User clicks card
    ↓
  onClick handler fired (parent decides action: navigate, select, etc.)

BADGE DISPLAY:
  Parent passes: variant ("passed", "failed", "learning", etc.)
    ↓
  Badge maps variant → color classes
    ↓
  Badge renders colored badge with text

PROFILE DROPDOWN:
  Initial state: open = false
    ↓
  User clicks button: open = true, dropdown shows
    ↓
  User clicks logout: logout() called, dropdown closes, navigate to /auth
    ↓
  User clicks outside: dropdown closes (via document click listener)

ERROR BOUNDARY:
  Page renders normally
    ↓
  If error occurs during render:
    ↓
  ErrorBoundary catches it, sets hasError = true
    ↓
  Renders fallback UI (error icon + message + retry button)
    ↓
  AppShell (nav/footer) still visible
```

## Dependencies

### Depends On:
- **React** - For component rendering and hooks
- **React Router** - useLocation, Link for navigation
- **React Icons** - HiOutlineMoon, HiSun, HiHome, etc. for icon display
- **Tailwind CSS** - All styling via utility classes
- **context/AppContext** - useApp() hook for roadmap/progress data (Footer)
- **context/AuthContext** - useAuth() hook for user logout (ProfileDropdown)
- **hooks/useTheme** - useTheme() hook for dark mode toggle (Navbar)

### Depended On By:
- **pages/** - All pages import layout components and UI primitives
- **AppShell** - Wraps all authenticated page routes (defined in App.jsx)
- **AuthPage** - Uses Button, Card, ErrorBoundary
- **SessionPage** - Uses Button, Card, Badge, LoadingSpinner, StatCard
- **ProgressPage** - Uses StatCard, Badge, Card
- **RoadmapPage** - Uses Card, Button, Badge

## Common Mistakes / Gotchas

1. **Forgetting to pass required props** - Button without onClick, Card without children, Badge without variant. Check JSDoc comments for required props.

2. **Using components outside provider tree** - Navbar/ProfileDropdown use useAuth(), Footer uses useApp(). If parent providers are missing, hooks throw errors.

3. **Adding logic to UI components** - UI components should be pure: accept props, render, call callbacks. If logic needed, add to parent page instead.

4. **Hardcoding colors in components** - Use custom colors from tailwind.config.js (navy, accent, pass, fail) not hardcoded hex values. Makes theming impossible.

5. **Breaking responsive layout** - Don't remove md:hidden/md:flex classes. Mobile/desktop navs are designed separately; combining breaks UX.

6. **ErrorBoundary only catches render errors** - Doesn't catch errors in useEffect, event handlers, or async operations. Wrap those with try/catch.

7. **Dark mode classes missing dark: prefix** - Component has `text-gray-900` but needs `dark:text-white`. Without dark: prefix, light color shows in dark mode.

8. **Forgetting to update ProfileDropdown when logout() signature changes** - If AuthContext.logout() changes, ProfileDropdown breaks silently.

9. **Clicking Card when no onClick provided** - Card won't show hover effects if onClick missing. Even if not needed, either provide it or use div instead.

10. **Badge variant typo** - Badge variants are exact: "passed", "failed", "learning", "exam", "revision", "needs-revision", "locked", "current". Typo falls back to "locked".

11. **LoadingSpinner size typo** - Valid sizes are "sm", "md", "lg" only. Other values render with wrong dimensions.

12. **Navbar logo path hardcoded** - Logo path is `/skill-master-logo.svg`. If image doesn't exist, shows broken icon. Check public/ folder.

## Extension Points

### Adding a New UI Component

1. **Create file** in `ui/` folder (e.g., `Alert.jsx`):
   ```jsx
   export default function Alert({ type = "info", message, onClose }) {
     const colors = {
       info: "bg-blue-100 text-blue-900",
       warn: "bg-warn/10 text-warn",
       error: "bg-fail/10 text-fail",
     };
     return (
       <div className={`p-4 rounded ${colors[type]}`}>
         {message}
         {onClose && <button onClick={onClose}>×</button>}
       </div>
     );
   }
   ```

2. **Import in page** component:
   ```jsx
   import Alert from "../../components/ui/Alert";
   ```

3. **Use with props**:
   ```jsx
   <Alert type="warn" message="You're running out of time" onClose={() => setAlert(null)} />
   ```

### Adding a New Layout Component

1. **Create file** in `layout/` folder (e.g., `Sidebar.jsx`):
   ```jsx
   export default function Sidebar({ sections }) {
     return (
       <aside className="w-64 bg-navy-mid border-r border-divider p-4">
         {sections.map(section => (
           <div key={section.id} className="mb-6">
             <h3 className="font-bold mb-2">{section.title}</h3>
             {section.items.map(item => (...))}
           </div>
         ))}
       </aside>
     );
   }
   ```

2. **Update AppShell** to include Sidebar:
   ```jsx
   <AppShell>
     <div className="flex">
       <Sidebar sections={...} />
       <main className="flex-1">
         {/* content */}
       </main>
     </div>
   </AppShell>
   ```

### Adding a New Badge Variant

1. **Update Badge.jsx** variants object:
   ```jsx
   const variants = {
     learning: "bg-accent/10 text-accent",
     revision: "bg-warn/10 text-warn",
     exam: "bg-fail/10 text-fail",
     "in-progress": "bg-blue-100 text-blue-900",  // NEW
     // ... rest
   };
   ```

2. **Use in page**:
   ```jsx
   <Badge variant="in-progress">In Progress</Badge>
   ```

### Modifying Button Variants

1. **Edit Button.jsx**:
   ```jsx
   const variants = {
     primary: "...",
     secondary: "...",
     outline: "border-2 border-accent text-accent hover:bg-accent/10",  // NEW
   };
   ```

2. **Use** `<Button variant="outline">Click me</Button>`

### Styling Consistency

- **Colors**: Use custom colors from `tailwind.config.js` (navy, accent, pass, fail, warn)
- **Spacing**: Use Tailwind scale (px-3, py-4, gap-2, etc.)
- **Breakpoints**: Use md: for desktop, default for mobile (mobile-first)
- **Shadows**: Use shadow-md (card shadow), shadow-lg, shadow-none for dark mode
- **Border**: Use border-gray-100 (light), border-navy-light (dark)

### Testing Components

```jsx
// Mock component in test file
test('Button calls onClick when clicked', () => {
  const mock = jest.fn();
  render(<Button onClick={mock}>Click</Button>);
  fireEvent.click(screen.getByText('Click'));
  expect(mock).toHaveBeenCalled();
});

// Test with props
test('Card shows hover effect when clickable', () => {
  render(<Card onClick={jest.fn()}>Content</Card>);
  const card = screen.getByText('Content').closest('div');
  expect(card).toHaveClass('cursor-pointer');
});
```
