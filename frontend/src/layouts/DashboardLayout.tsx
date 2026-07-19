import { Outlet } from "react-router-dom";
import Topbar from "@/components/nav/Topbar.tsx";
import Sidebar from "@/components/nav/Sidebar.tsx";

export default function DashboardLayout() {
  return (
    <div className="flex h-dvh flex-col bg-canvas">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
