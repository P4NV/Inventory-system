# Frontend

React 19 + TypeScript, built with Vite 8. Styled with Tailwind CSS v4, animated
with [Motion](https://motion.dev). Icons from [lucide-react](https://lucide.dev).
Routed with react-router-dom v7.

## Commands

```bash
npm install
npm run dev       # start dev server at http://localhost:5173
npm run build     # type-check (tsc) + production build (vite)
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
    Home.tsx                    Landing page (stats, quick actions, system status)
    Dashboard.tsx               Analytics with Recharts bar charts
    Inventory.tsx               Inventory CRUD page
    AuthPage.tsx                Login/register form
    NotFound.tsx                404 page

  components/
    ui/
      Modal.tsx                 Reusable <dialog> modal
      ErrorBoundary.tsx         Catches React crash errors gracefully
    nav/
      Sidebar.tsx               NavLink sidebar with lucide-react icons
      Topbar.tsx                Auth-aware top bar (user dropdown with real name/email)
    features/
      StackStatus.tsx           Health check display (3-layer stack status)
      SignalLog.tsx             Animated read-only item list (home page demo)
      InventoryManager.tsx      CRUD table with add modal, optimistic updates

  lib/
    api.ts                      Typed fetch client, types, API methods, CATEGORIES constant
    auth-context.tsx            React context for auth state (user, login, logout, loading)
```

## Authentication

Auth is handled by `AuthContext` (`src/lib/auth-context.tsx`):

- **Token persistence** — JWT stored in `localStorage` under `inv_token`, survives page reloads
- **Session restore** — on mount, calls `GET /auth/me` with the stored token to fetch the user profile
- **Reactive state** — `useAuth()` exposes `{ user, loading, login, logout }` to any component
- **Route guards** — `ProtectedRoute` redirects to `/login` if unauthenticated; `GuestRoute` redirects
  to `/dashboard` if already authenticated
- **Auto-logout** — on 401 responses the token is cleared automatically

```tsx
import { useAuth } from "@/lib/auth-context";

function MyComponent() {
  const { user, logout } = useAuth();
  return <p>Hello, {user?.name}</p>;
}
```

## Routing

Routes are defined in `App.tsx` with auth guards:

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

const items: Item[] = await api.listItems();
const created = await api.createItem({ name: "Widget", sku: "W-001", amount: 10, price: 9.99 });
const updated = await api.updateItem(id, { price: 7.50 });
await api.deleteItem(id);

// Auth
const { user, token } = await api.login({ email, password });
const profile = await api.me();
```

## Icons

This project uses [lucide-react](https://lucide.dev) for all UI icons.
Import any Lucide icon by name:

```tsx
import { Package, DollarSign, User } from "lucide-react";
<Package size={16} />
```

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

The inventory form's `<select>` reads from this array. To add a new category,
just append a string — no other changes needed.

## Modal component

`src/components/ui/Modal.tsx` wraps the native `<dialog>` element:

```tsx
<Modal open={isOpen} onClose={() => setIsOpen(false)} title="Add item">
  {/* form content */}
</Modal>
```

- Uses `showModal()` / `close()` for proper focus trapping and backdrop
- Clicking the backdrop or pressing Escape closes it

## ErrorBoundary

`src/components/ui/ErrorBoundary.tsx` wraps the entire app. If a component
crashes, it shows a friendly fallback with a reload button instead of a white
screen.

## Environment

Copy `.env.example` to `.env` and set `VITE_API_URL` to the backend URL
(defaults to `http://localhost:3000`).
