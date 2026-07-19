import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-start justify-center px-6 bg-canvas">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">404</p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-ink">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20 transition-colors">
        <ArrowLeft size={14} />
        Back to home
      </Link>
    </main>
  );
}