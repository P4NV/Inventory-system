import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <span className="text-4xl text-warn">⚠</span>
          <h2 className="mt-4 font-display text-lg font-semibold text-ink">Something went wrong</h2>
          <p className="mt-1 text-sm text-ink-soft">{this.state.error?.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-strong"
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}