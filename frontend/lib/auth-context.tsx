"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { UserSummary, login as apiLogin, signup as apiSignup } from "./api";

interface AuthContextType {
  user: UserSummary | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { email: string; password: string; displayName: string; age: number; gender: string }) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = Cookies.get("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        Cookies.remove("user");
      }
    }
    setLoading(false);
  }, []);

  const persistSession = (token: string, expiresAt: string, userSummary: UserSummary) => {
    const expires = new Date(expiresAt);
    Cookies.set("token", token, { expires });
    Cookies.set("user", JSON.stringify(userSummary), { expires });
    setUser(userSummary);
  };

  const login = async (email: string, password: string) => {
    const res = await apiLogin({ email, password });
    persistSession(res.token, res.expiresAt, res.user);
    router.push(res.user.role === "Admin" ? "/admin" : "/discover");
  };

  const signup = async (data: { email: string; password: string; displayName: string; age: number; gender: string }) => {
    const res = await apiSignup(data);
    persistSession(res.token, res.expiresAt, res.user);
    router.push("/discover");
  };

  const logout = () => {
    Cookies.remove("token");
    Cookies.remove("user");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, isAdmin: user?.role === "Admin" }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
