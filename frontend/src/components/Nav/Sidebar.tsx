import { NavLink } from "react-router-dom";
import { navItems } from "@/config/navigation.ts";
import { Home, BarChart3, Package } from "lucide-react";

const iconMap: Record<string, typeof Home> = {
  Home: Home,
  Dashboard: BarChart3,
  Inventory: Package,
};

export default function Sidebar() {
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
      <div className="border-t border-line p-4">
        <p className="text-xs text-ink-muted">Inventory v1.0</p>
      </div>
    </aside>
  );
}