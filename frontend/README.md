# Frontend

React 19 + TypeScript, built with Vite 8. Styled with Tailwind CSS v4, animated
with [Motion](https://motion.dev). Icons from [lucide-react](https://lucide.dev).
Charts from [Recharts](https://recharts.org). PDF generation with [jsPDF](https://github.com/parallax/jsPDF).

## Commands

```bash
npm install
npm run dev       # start dev server at http://localhost:5173
npm run build     # type-check (tsc -b) + production build (vite build)
npm run lint      # run oxlint
npm run preview   # preview the production build locally
```

## Structure

```
src/
  main.tsx                      React root mount (StrictMode + createRoot)
  App.tsx                       Router with auth-aware route guards
  index.css                     Tailwind v4 import + @theme design tokens

  config/
    navigation.ts               Centralized nav items — add new pages here

  layouts/
    DashboardLayout.tsx         Shared Topbar + Sidebar + <Outlet/>

  pages/
    Home.tsx                    Landing page (stats cards, quick actions)
    Dashboard.tsx               Analytics: KPI cards, bar charts, stock donut
    Inventory.tsx               View-only item table + PDF report download buttons
    AuthPage.tsx                Login / register / guest form
    NotFound.tsx                404 page

  components/
    ui/
      ErrorBoundary.tsx         Catches React crash errors gracefully
    nav/
      Sidebar.tsx               NavLink sidebar + Download Report dropdown
      Topbar.tsx                Cmd+K global search + user dropdown with sign-out
    features/
      InventoryManager.tsx      Read-only item table with search filtering

  lib/
    api.ts                      Typed fetch client, types, API methods
    auth-context.tsx            React context for auth state (user, login, logout)
    inventory-context.tsx       Items state context (auto-fetches on mount)
    report.ts                   PDF generation using jsPDF + jspdf-autotable
    search.ts                   Search scoring engine for items and pages
```

## Authentication

Auth is handled by `AuthContext` (`src/lib/auth-context.tsx`):

- **Token persistence** — JWT stored in `localStorage` under `inv_token`, survives page reloads
- **Session restore** — on mount, calls `GET /auth/me` with the stored token
- **Reactive state** — `useAuth()` exposes `{ user, loading, login, logout }`
- **Route guards** — `ProtectedRoute` redirects to `/login` if unauthenticated; `GuestRoute`
  redirects to `/dashboard` if already authenticated
- **Guest mode** — "Continue as guest" on the login page creates a 24-hour session with
  `role: "guest"` (write operations disabled, "Guest" badge shown in topbar)

```tsx
import { useAuth } from "@/lib/auth-context";

function MyComponent() {
  const { user, logout } = useAuth();
  return <p>Hello, {user?.name}</p>;
}
```

## Routing

Routes are defined in `App.tsx`:

```tsx
<BrowserRouter>
  <Routes>
    {/* Guest-only (redirect to /dashboard if logged in) */}
    <Route path="/login" element={<GuestRoute><AuthPage mode="login" /></GuestRoute>} />
    <Route path="/register" element={<GuestRoute><AuthPage mode="register" /></GuestRoute>} />

    {/* Protected (redirect to /login if not logged in) */}
    <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/inventory" element={<Inventory />} />
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
```

### Adding a page

1. Add a nav entry in `src/config/navigation.ts` — sidebar updates automatically
2. Create the page component in `src/pages/`
3. Register the route in `App.tsx` inside the layout block

## API client

`src/lib/api.ts` provides typed methods that call the backend. Auth tokens are
automatically read from `localStorage` and attached to every request.

```ts
import { api, type Item } from "@/lib/api";

// View items (public)
const items: Item[] = await api.listItems();

// Auth
const { user, token } = await api.login({ email, password });
const { user, token } = await api.register({ email, password, name: "John" });
const { user, token } = await api.guestLogin();
const profile = await api.me();
```

## PDF Reports

Reports are generated client-side with **jsPDF** + **jspdf-autotable** in `src/lib/report.ts`.

```ts
import { downloadReport } from "@/lib/report";
import type { ReportPeriod } from "@/lib/report";

// Download a report
downloadReport(items, "daily");   // items added today
downloadReport(items, "monthly"); // items added this month
downloadReport(items, "yearly");  // items added this year
```

Each PDF includes:
- Branded header with period label and date range
- Summary cards (total items, value, in/out of stock)
- Full item table with all columns
- Page numbers and generation timestamp

**Access points:** Download Report dropdown in the sidebar footer, or Daily/Monthly/Yearly
buttons on the Inventory page header.

## Charts (Dashboard)

Charts use **Recharts** in `src/pages/Dashboard.tsx`:

- **Row 1** — 6 KPI cards: total items, total value, in-stock count, categories, avg price, stock health
- **Row 2** — Two horizontal bar charts: items by category count, category inventory value
- **Row 3** — Monthly activity bar chart + stock health donut chart with legend

All charts use a custom dark tooltip and color-coded cells with value labels.

## Global search

Cmd+K opens the search bar in the topbar. It searches:
- **Items** — by name, SKU, and category (scored by match quality)
- **Pages** — by title and path

Results are grouped by category with keyboard navigation (arrow keys + Enter).

## Design tokens

Colors and fonts are defined in `src/index.css` via Tailwind's `@theme`:

```css
@theme {
  --color-accent: #73cefc;
  --color-ink: #eff0f0;
  --color-canvas: #141415;
  --font-display: "Space Grotesk", ...;
}
```

Override these to change the entire app's appearance.

## Categories

Item categories are defined in `src/lib/api.ts`:

```ts
export const CATEGORIES = [
  "general", "electronics", "furniture", "clothing",
  "food", "tools", "materials",
] as const;
```

To add a new category, just append a string — no other changes needed.

## Environment

```bash
VITE_API_URL=http://localhost:3000
```

Copy `.env.example` to `.env` and set `VITE_API_URL` to the backend URL.
