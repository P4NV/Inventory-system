import { useState, useRef, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "@/lib/auth-context.tsx";
import { User, Search, LogOut } from "lucide-react";

export default function Topbar() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function handleSignOut() {
    logout();
    setOpen(false);
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-10 flex h-14 w-full items-center justify-between gap-4 border-b border-line bg-canvas-raised/95 backdrop-blur supports-[backdrop-filter]:bg-canvas-raised/80 px-5">
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2.5 rounded-lg px-3 py-1.5 hover:bg-canvas-overlay transition-colors"
          aria-expanded={open}
          aria-haspopup="true"
        >
          <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
            <User size={16} />
          </div>
          <span className="text-sm text-ink">{user?.name ?? user?.email ?? "User"}</span>
        </button>
        {open && (
          <div className="absolute left-0 mt-2 min-w-48 rounded-lg border border-line bg-canvas-raised shadow-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-line">
              <p className="text-sm font-medium text-ink">{user?.name ?? "User"}</p>
              <p className="text-xs text-ink-muted truncate mt-0.5">{user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-warn hover:bg-canvas-overlay transition-colors"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 max-w-md relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />

        <input
          type="search"
          placeholder="Search items..."
          className="w-full rounded-lg border border-line bg-canvas pl-9 pr-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none transition-colors"
        />
      </div>

      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent">
        <User size={16} />
      </div>
    </header>
  );
}