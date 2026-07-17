# Frontend

React 19 + TypeScript, built with Vite 8. Styled with Tailwind CSS v4, animated
with [Motion](https://motion.dev). Routed with react-router-dom v7.

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
  App.tsx                       Router: BrowserRouter + nested layout routes
  index.css                     Tailwind v4 import + @theme design tokens
  vite-env.d.ts                 Vite client types

  config/
    navigation.ts               Centralized nav items — add new pages here

  layouts/
    DashboardLayout.tsx         Shared Topbar + Sidebar + <Outlet/>

  pages/
    Home.tsx                    Landing page (StackStatus + SignalLog)
    Inventory.tsx               Inventory CRUD page
    NotFound.tsx                404 (outside dashboard layout)

  components/
    nav/
      Sidebar.tsx               NavLink-based sidebar, reads from config/navigation
      Topbar.tsx                Top bar (user area, search, settings)
    features/
      StackStatus.tsx           Health check display (3-layer status cards)
      SignalLog.tsx             Read-only item list (home page demo)
      InventoryManager.tsx      Full CRUD table with form (inventory page)

  lib/
    api.ts                      Typed fetch client, types (Item, HealthStatus),
                                API methods (listItems, createItem, updateItem, deleteItem)
```

## Routing

Routes are defined in `App.tsx` using nested `<Route>` elements:

```tsx
<BrowserRouter>
  <Routes>
    {/* Pages inside the dashboard layout (get Topbar + Sidebar) */}
    <Route element={<DashboardLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/inventory" element={<Inventory />} />
    </Route>
    {/* Pages outside the layout (standalone) */}
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
```

### Adding a page

1. Add a nav entry in `src/config/navigation.ts`:
   ```ts
   { title: "Orders", path: "/orders" }
   ```
   The sidebar updates automatically.

2. Create `src/pages/Orders.tsx`:
   ```tsx
   export function Orders() {
     return <div className="mx-auto max-w-3xl"><h1>Orders</h1></div>;
   }
   ```

3. Register the route in `App.tsx` inside the `<Route element={<DashboardLayout />}>` block.

### Pages outside the dashboard

For standalone pages (login, 404), add them outside the layout route:

```tsx
<Route path="/login" element={<Login />} />
<Route path="*" element={<NotFound />} />
```

## API client

`src/lib/api.ts` provides typed methods that call the backend:

```ts
import { api, type Item } from "@/lib/api";

// List all items
const items: Item[] = await api.listItems();

// Create an item
const created = await api.createItem({ name: "Widget", sku: "W-001", amount: 10, price: 9.99 });

// Partial update
const updated = await api.updateItem(id, { price: 7.50, isInStock: false });

// Delete
await api.deleteItem(id);
```

### Adding a new API method

1. Add the type to `api.ts`:
   ```ts
   export type Order = { id: string; customer: string; total: number };
   ```
2. Add the method to the `api` object:
   ```ts
   listOrders: () => request<Order[]>("/orders"),
   ```

## Design tokens

Colors and fonts are defined in `src/index.css` via Tailwind's `@theme`:

```css
@theme {
  --color-accent: #2a6f6f;
  --color-warn: #b5542a;
  --font-display: "Space Grotesk", ...;
  /* etc. */
}
```

Override these to change the entire app's appearance.

## Environment

Copy `.env.example` to `.env` and set `VITE_API_URL` to the backend URL
(defaults to `http://localhost:3000`).
