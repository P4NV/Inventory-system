import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";

export default function Topbar() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  return (
    <header className="sticky top-0 z-10 flex h-12 w-full items-center justify-between gap-4 border-b border-line bg-canvas-raised/95 backdrop-blur supports-[backdrop-filter]:bg-canvas-raised/80 px-4">
      {/* Left side - User dropdown (was Inventory title) */}
      <div className="relative min-w-44" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 rounded-full px-3 py-1.5 hover:bg-canvas-overlay transition-colors w-full justify-center sm:justify-start"
          aria-expanded={open}
          aria-haspopup="true"
        >
          <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-medium text-sm">
            U
          </div>
          <span className="hidden sm:block text-sm text-ink">User</span>
        </button>
        {open && (
          <div className="absolute left-0 mt-2 min-w-48 rounded-md border border-line bg-canvas-raised shadow-lg overflow-hidden">
            <NavLink
              to="/login"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm text-ink hover:bg-canvas-overlay"
            >
              Sign In
            </NavLink>
            <NavLink
              to="/register"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm text-ink hover:bg-canvas-overlay"
            >
              Register
            </NavLink>
            <hr className="border-line my-1" />
            <NavLink
              to="/settings"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm text-ink hover:bg-canvas-overlay"
            >
              Preferences
            </NavLink>
            <NavLink
              to="/settings"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm text-ink hover:bg-canvas-overlay"
            >
              Settings
            </NavLink>
            <hr className="border-line my-1" />
            <button className="w-full text-left px-3 py-2 text-sm text-warn hover:bg-canvas-overlay">
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Center - Search */}
      <div className="flex-1 max-w-md">
        <input
          type="search"
          placeholder="Search items..."
          className="w-full rounded-md border border-line bg-canvas px-3 py-1.5 text-sm text-ink placeholder:text-ink-soft focus:border-accent focus:outline-none"
        />
      </div>

      {/* Right side - Inventory title (was User) */}
      <div className="flex items-center gap-4 min-w-44 justify-end">
        <h1 className="text-sm font-medium text-ink">Inventory</h1>
      </div>
    </header>
  );
}