import { NavLink } from "react-router-dom";
import { navItems } from "@/config/navigation.ts";

export default function Sidebar() {
  return (
    <aside className="h-full min-w-44 max-w-44 border-r border-line bg-canvas-raised flex flex-col">
      <nav className="flex flex-col gap-1 p-4 overflow-y-auto flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-accent text-white"
                  : "text-ink hover:bg-canvas"
              }`
            }
          >
            {item.title}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-line text-xs text-ink-soft">
        Inventory App v1.0
      </div>
    </aside>
  );
}
