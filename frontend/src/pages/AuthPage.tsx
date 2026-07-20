import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context.tsx";
import { LogIn, UserPlus, AlertCircle, UserRound } from "lucide-react";

interface AuthPageProps {
  mode: "login" | "register";
}

export function AuthPage({ mode }: AuthPageProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const isLogin = mode === "login";

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    const newErrors: Partial<typeof form> = {};
    if (!form.email.includes("@")) newErrors.email = "Invalid email";
    if (form.password.length < 8) newErrors.password = "Min 8 characters";
    if (!isLogin && form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }
    if (!isLogin && !form.name.trim()) newErrors.name = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      let response;
      if (isLogin) {
        response = await api.login({ email: form.email, password: form.password });
      } else {
        response = await api.register({ name: form.name, email: form.email, password: form.password });
      }
      login(response.token, response.user);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setError(null);
    setGuestLoading(true);
    try {
      const response = await api.guestLogin();
      login(response.token, response.user);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Could not start a guest session");
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-12 bg-canvas">
      <motion.div
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="rounded-xl border border-line bg-canvas-raised p-8 shadow-lg">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
              {isLogin ? <LogIn size={22} className="text-accent" /> : <UserPlus size={22} className="text-accent" />}
            </div>
            <h1 className="font-display text-2xl font-semibold text-ink">
              {isLogin ? "Welcome back" : "Create account"}
            </h1>
            <p className="mt-2 text-sm text-ink-soft">
              {isLogin
                ? "Sign in to access your inventory"
                : "Start managing your inventory today"}
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-lg bg-error-soft px-4 py-3 text-sm text-error">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none transition-colors ${
                    errors.name ? "border-error" : "border-line bg-canvas focus:border-accent"
                  }`}
                  placeholder="John Doe"
                  autoComplete="name"
                />
                {errors.name && (
                  <p className="mt-1.5 text-xs text-error">{errors.name}</p>
                )}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none transition-colors ${
                  errors.email ? "border-error" : "border-line bg-canvas focus:border-accent"
                }`}
                placeholder="john@example.com"
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-error">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none transition-colors ${
                  errors.password ? "border-error" : "border-line bg-canvas focus:border-accent"
                }`}
                placeholder="••••••••"
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
              {errors.password && (
                <p className="mt-1.5 text-xs text-error">{errors.password}</p>
              )}
            </div>

            {!isLogin && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none transition-colors ${
                    errors.confirmPassword ? "border-error" : "border-line bg-canvas focus:border-accent"
                  }`}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-error">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || guestLoading}
              className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-strong disabled:opacity-50 active:scale-[0.98]"
            >
              {loading ? "Please wait…" : isLogin ? "Sign in" : "Create account"}
            </button>
          </form>

          {isLogin && (
            <>
              <div className="my-6 flex items-center gap-3 text-xs text-ink-muted">
                <div className="h-px flex-1 bg-line" />
                <span>or</span>
                <div className="h-px flex-1 bg-line" />
              </div>

              <button
                type="button"
                onClick={handleGuest}
                disabled={loading || guestLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-canvas px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-canvas-overlay disabled:opacity-50"
              >
                <UserRound size={14} className="text-accent" />
                {guestLoading ? "Starting session…" : "Continue as guest"}
              </button>
              <p className="mt-2 text-center text-[11px] text-ink-muted">
                View-only access · expires in 24 hours
              </p>
            </>
          )}

          <p className="mt-6 text-center text-sm text-ink-soft">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <NavLink
              to={isLogin ? "/register" : "/login"}
              className="font-medium text-accent hover:text-accent-strong transition-colors"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </NavLink>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
