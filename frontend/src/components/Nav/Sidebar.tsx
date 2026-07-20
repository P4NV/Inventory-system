import { NavLink } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { navItems } from "@/config/navigation.ts";
import { Home, BarChart3, Package, FileDown, ChevronDown } from "lucide-react";
import { useInventory } from "@/lib/inventory-context.tsx";
import { downloadReport, type ReportPeriod } from "@/lib/report.ts";

const iconMap: Record<string, typeof Home> = {
  Home: Home,
  Dashboard: BarChart3,
  Inventory: Package,
};

export default function Sidebar() {
  const { items } = useInventory();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleDownload(period: ReportPeriod) {
    downloadReport(items, period);
    setOpen(false);
  }

  return (
    <aside className="h-full min-w-48 max-w-48 border-r border-line bg-canvas-raised flex flex-col">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-xs font-bold text-white">
          I
        </span>
        <span className="font-display text-sm font-semibold text-ink">Inventory</span>
      </div>
      <nav className="flex flex-col gap-1 p-3 overflow-y-auto flex-1">
        {navItems.map((item) => {
          const Icon = iconMap[item.title];
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-accent/10 text-accent"
                    : "text-ink-soft hover:bg-canvas hover:text-ink"
                }`
              }
            >
              <Icon size={16} />
              {item.title}
            </NavLink>
          );
        })}
      </nav>
      <div className="border-t border-line p-3" ref={ref}>
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-canvas hover:text-ink transition-colors"
          >
            <FileDown size={15} />
            <span>Download Report</span>
            <ChevronDown size={14} className={`ml-auto transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
          </button>
          {open && (
            <div className="absolute bottom-full left-0 right-0 mb-1 rounded-lg border border-line bg-canvas-raised shadow-xl overflow-hidden">
              {(["daily", "monthly", "yearly"] as ReportPeriod[]).map((p) => (
                <button
                  key={p}
                  onClick={() => handleDownload(p)}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-ink-soft hover:bg-canvas hover:text-ink transition-colors"
                >
                  <FileDown size={13} className="text-accent" />
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="mt-2 text-center text-[10px] text-ink-muted">Inventory v1.0</p>
      </div>
    </aside>
  );
}
