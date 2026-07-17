import { NavLink } from "react-router-dom";
import { navItems } from "@/config/navigation.ts";

export default function Sidebar() {
  return (
    <div className="min-w-44 max-w-44 border-r border-line bg-gray-500">
      <nav className="flex flex-col gap-1 p-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-accent text-white"
                  : "text-ink hover:bg-canvas-raised"
              }`
            }
          >
            {item.title}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
