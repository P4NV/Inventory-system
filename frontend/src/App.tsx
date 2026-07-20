import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout.tsx";
import { Home } from "@/pages/Home.tsx";
import { Inventory } from "@/pages/Inventory.tsx";
import { Dashboard } from "@/pages/Dashboard.tsx";
import { NotFound } from "@/pages/NotFound.tsx";
import { AuthPage } from "@/pages/AuthPage.tsx";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary.tsx";
import { AuthProvider, useAuth } from "@/lib/auth-context.tsx";
import { InventoryProvider } from "@/lib/inventory-context.tsx";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<GuestRoute><AuthPage mode="login" /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><AuthPage mode="register" /></GuestRoute>} />
            <Route
              element={
                <ProtectedRoute>
                  <InventoryProvider>
                    <DashboardLayout />
                  </InventoryProvider>
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/inventory" element={<Inventory />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
