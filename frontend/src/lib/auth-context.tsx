import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { api, getStoredToken, setStoredToken, type User } from "@/lib/api";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api.me()
      .then(setUser)
      .catch(() => {
        setStoredToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (token: string, user: User) => {
    setStoredToken(token);
    setUser(user);
  };

  const logout = () => {
    setStoredToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}