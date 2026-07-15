import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-start justify-center px-6">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">404</p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-ink">
        Nothing running at this route.
      </h1>
      <Link to="/" className="mt-4 text-sm text-accent hover:text-accent-strong">
        ← Back home
      </Link>
    </main>
  );
}
