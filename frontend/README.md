# Frontend

React 19 + TypeScript, built with Vite. Styled with Tailwind CSS v4, animated with [Motion](https://motion.dev).

## Commands

```bash
npm install
npm run dev       # start dev server at http://localhost:5173
npm run build     # type-check + production build to dist/
npm run preview   # preview the production build locally
```

## Structure

```
src/
  components/   StackStatus, SignalLog — the demo pieces on the home page
  lib/api.ts    typed fetch client for the backend
  pages/        route-level components (Home, NotFound)
  index.css     Tailwind import + design tokens (@theme)
```

## Environment

Copy `.env.example` to `.env` and point `VITE_API_URL` at the backend
(defaults to `http://localhost:3000`).
