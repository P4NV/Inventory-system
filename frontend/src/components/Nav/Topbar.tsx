import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth-context.tsx";
import { useInventory } from "@/lib/inventory-context.tsx";
import { isGuest } from "@/lib/api";
import { User, Search, LogOut, Package, Layout, X } from "lucide-react";
import { searchItems, searchPages, groupResults, type SearchResult } from "@/lib/search.ts";

export default function Topbar() {
  const { user, logout } = useAuth();
  const { items: inventoryItems } = useInventory();
  const [open, setOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close popovers on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(target)) {
        setUserOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset highlight when query changes
  useEffect(() => {
    setHighlight(0);
  }, [query]);

  // Clear search on route change
  useEffect(() => {
    setQuery("");
    setOpen(false);
  }, [location.pathname]);

  // Cmd/Ctrl+K focuses the search input
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo<{
    items: ReturnType<typeof searchItems>;
    pages: ReturnType<typeof searchPages>;
    flat: SearchResult[];
  }>(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      return { items: [], pages: [], flat: [] };
    }
    const items = searchItems(inventoryItems, trimmed);
    const pages = searchPages(trimmed);
    return { items, pages, flat: [...items, ...pages] };
  }, [query, inventoryItems]);

  const grouped = useMemo(
    () => groupResults(results.items, results.pages),
    [results.items, results.pages],
  );

  function goTo(result: SearchResult) {
    setOpen(false);
    setQuery("");
    if (result.kind === "item") {
      navigate(`/inventory?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate(result.path);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    } else if (e.key === "ArrowDown" && results.flat.length > 0) {
      e.preventDefault();
      setHighlight((h) => (h + 1) % results.flat.length);
    } else if (e.key === "ArrowUp" && results.flat.length > 0) {
      e.preventDefault();
      setHighlight((h) => (h - 1 + results.flat.length) % results.flat.length);
    } else if (e.key === "Enter" && results.flat.length > 0) {
      e.preventDefault();
      goTo(results.flat[highlight]);
    }
  }

  function handleSignOut() {
    logout();
    setUserOpen(false);
    navigate("/login");
  }

  const showPopover = open && query.trim().length > 0;
  let flatCursor = 0;
  const itemIndex = (i: number) => flatCursor + i;
  flatCursor += results.items.length;
  const pageIndex = (i: number) => flatCursor + i;

  return (
    <header className="sticky top-0 z-20 flex h-14 w-full items-center gap-4 border-b border-line bg-canvas-raised/95 backdrop-blur supports-[backdrop-filter]:bg-canvas-raised/80 px-5">
      <div className="relative" ref={userDropdownRef}>
        <button
          onClick={() => setUserOpen(!userOpen)}
          className="flex items-center gap-2.5 rounded-lg px-3 py-1.5 hover:bg-canvas-overlay transition-colors"
          aria-expanded={userOpen}
          aria-haspopup="true"
        >
          <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
            <User size={16} />
          </div>
          <span className="text-sm text-ink">
            {user?.name ?? user?.email ?? "User"}
          </span>
          {user && isGuest(user) && (
            <span className="ml-2 rounded-md bg-warn/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-warn">
              Guest
            </span>
          )}
        </button>
        {userOpen && (
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

      <div className="flex-1 max-w-md relative" ref={dropdownRef}>
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search items, pages..."
          className="w-full rounded-lg border border-line bg-canvas pl-9 pr-16 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none transition-colors"
          aria-label="Search items and pages"
        />
        {query ? (
          <button
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded text-ink-muted hover:bg-canvas-overlay hover:text-ink"
            aria-label="Clear search"
          >
            <X size={12} />
          </button>
        ) : (
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 rounded border border-line bg-canvas-overlay px-1.5 py-0.5 text-[10px] font-mono text-ink-muted">
            ⌘K
          </kbd>
        )}

        {showPopover && (
          <div className="absolute left-0 right-0 top-full mt-2 max-h-96 overflow-y-auto rounded-lg border border-line bg-canvas-raised shadow-2xl">
            {grouped.total === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-ink-muted">
                No results for "{query}"
              </div>
            ) : (
              <div className="py-1">
                {grouped.itemsByCategory.map((group) => (
                  <div key={group.category}>
                    <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-ink-muted">
                      {group.category}
                    </div>
                    {group.items.map((it) => {
                      const idx = itemIndex(results.items.indexOf(it));
                      return (
                        <button
                          key={it.id}
                          onClick={() => goTo(it)}
                          onMouseEnter={() => setHighlight(idx)}
                          className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
                            highlight === idx ? "bg-accent/10" : "hover:bg-canvas-overlay"
                          }`}
                        >
                          <Package size={14} className="text-accent shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-ink truncate">{it.name}</div>
                            <div className="text-xs text-ink-muted font-mono truncate">{it.sku}</div>
                          </div>
                          <span className="text-[10px] text-ink-muted uppercase">{it.matchField}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
                {grouped.pages.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-ink-muted border-t border-line">
                      Pages
                    </div>
                    {grouped.pages.map((pg) => {
                      const idx = pageIndex(grouped.pages.indexOf(pg));
                      return (
                        <button
                          key={pg.path}
                          onClick={() => goTo(pg)}
                          onMouseEnter={() => setHighlight(idx)}
                          className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
                            highlight === idx ? "bg-accent/10" : "hover:bg-canvas-overlay"
                          }`}
                        >
                          <Layout size={14} className="text-ink-soft shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-ink truncate">{pg.title}</div>
                            {pg.description && (
                              <div className="text-xs text-ink-muted truncate">{pg.description}</div>
                            )}
                          </div>
                          <span className="text-[10px] text-ink-muted font-mono">{pg.path}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {user && isGuest(user) && (
        <div className="ml-2 text-xs text-ink-muted">
          Logged in as guest
        </div>
      )}
    </header>
  );
}
