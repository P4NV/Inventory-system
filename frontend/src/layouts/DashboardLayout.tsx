import { Outlet } from "react-router-dom";
import Topbar from "@/components/nav/Topbar.tsx";
import Sidebar from "@/components/nav/Sidebar.tsx";

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Topbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
