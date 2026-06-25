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

const ACCESS_KEY = "pwnable_access_token";
const REFRESH_KEY = "pwnable_refresh_token";
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

function persistTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const accessToken = getAccessToken();
    const refreshToken = localStorage.getItem(REFRESH_KEY);

    if (!accessToken && !refreshToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      if (accessToken) {
        const me = await api.me(accessToken);
        setUser(me);
        return;
      }
    } catch (err) {
      if (err instanceof ApiError && err.message === "Account suspended") {
        sessionStorage.setItem(SUSPENDED_FLAG_KEY, "1");
      }
    }

    if (refreshToken) {
      try {
        const res = await api.refresh(refreshToken);
        persistTokens(res.accessToken, res.refreshToken);
        setUser(res.user);
        return;
      } catch (err) {
        if (err instanceof ApiError && err.message === "Account suspended") {
          sessionStorage.setItem(SUSPENDED_FLAG_KEY, "1");
        }
        clearTokens();
      }
    }

    setUser(null);
  }, []);

  useEffect(() => {
    loadUser().finally(() => setIsLoading(false));
  }, [loadUser]);

  const login = useCallback(async (username: string, password: string) => {
    const res = await api.login(username, password);
    sessionStorage.removeItem(SUSPENDED_FLAG_KEY);
    persistTokens(res.accessToken, res.refreshToken);
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
      persistTokens(res.accessToken, res.refreshToken);
      setUser(res.user);
    },
    [],
  );

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem(REFRESH_KEY) ?? undefined;
    try {
      await api.logout(refreshToken);
    } catch {
      // ignore
    }
    clearTokens();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;
    try {
      const me = await api.me(token);
      setUser(me);
    } catch (err) {
      if (err instanceof ApiError && err.message === "Account suspended") {
        sessionStorage.setItem(SUSPENDED_FLAG_KEY, "1");
        clearTokens();
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