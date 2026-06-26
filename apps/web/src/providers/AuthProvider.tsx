"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, ApiError, type AuthUser } from "@/lib/api";
import { scoreToLevel } from "@/lib/level";

const SUSPENDED_FLAG_KEY = "pwnable_account_suspended";

type AuthContextValue = {
  user: AuthUser | null;
  level: number;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: {
    username: string;
    password: string;
    email?: string;
    displayName?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: AuthUser) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const res = await api.session();
      setUser(res.user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    loadUser().finally(() => setIsLoading(false));
  }, [loadUser]);

  const login = useCallback(async (username: string, password: string) => {
    const res = await api.login(username, password);
    sessionStorage.removeItem(SUSPENDED_FLAG_KEY);
    setUser(res.user);
  }, []);

  const register = useCallback(
    async (data: {
      username: string;
      password: string;
      email?: string;
      displayName?: string;
    }) => {
      const res = await api.register(data);
      setUser(res.user);
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    }
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const me = await api.me();
      if (!me) {
        setUser(null);
        return;
      }
      setUser(me);
    } catch (err) {
      if (err instanceof ApiError && err.message === "Account suspended") {
        sessionStorage.setItem(SUSPENDED_FLAG_KEY, "1");
        setUser(null);
      }
      throw err;
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      level: user ? scoreToLevel(user.score) : 1,
      isLoading,
      login,
      register,
      logout,
      refreshUser,
      setUser,
    }),
    [user, isLoading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}