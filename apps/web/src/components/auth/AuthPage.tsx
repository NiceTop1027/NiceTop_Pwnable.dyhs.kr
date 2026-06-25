"use client";

import { useCallback, useState } from "react";
import { AuthShell, type AuthMode } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";

function modeToPath(mode: AuthMode) {
  return mode === "register" ? "/auth?tab=register" : "/auth";
}

export function AuthPage({ initialMode = "login" }: { initialMode?: AuthMode }) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [direction, setDirection] = useState(0);

  const switchMode = useCallback((next: AuthMode) => {
    setDirection(next === "register" ? 1 : -1);
    setMode(next);
    window.history.replaceState(null, "", modeToPath(next));
  }, []);

  return (
    <AuthShell mode={mode} direction={direction} onModeChange={switchMode}>
      {mode === "login" ? <LoginForm /> : <RegisterForm />}
    </AuthShell>
  );
}