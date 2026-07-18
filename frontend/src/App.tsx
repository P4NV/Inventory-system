import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout.tsx";
import { Home } from "@/pages/Home.tsx";
import { Inventory } from "@/pages/Inventory.tsx";
import { Dashboard } from "@/pages/Dashboard.tsx";
import { NotFound } from "@/pages/NotFound.tsx";
import { AuthPage } from "@/pages/AuthPage.tsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
