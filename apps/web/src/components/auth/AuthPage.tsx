"use client";

import { useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AuthShell, type AuthMode } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { appendNextToAuthPath } from "@/lib/auth-redirect";

export function AuthPage({ initialMode = "login" }: { initialMode?: AuthMode }) {
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [direction, setDirection] = useState(0);

  const switchMode = useCallback((nextMode: AuthMode) => {
    setDirection(nextMode === "register" ? 1 : -1);
    setMode(nextMode);
    const base = nextMode === "register" ? "/auth?tab=register" : "/auth";
    window.history.replaceState(null, "", appendNextToAuthPath(base, next));
  }, [next]);

  return (
    <AuthShell mode={mode} direction={direction} onModeChange={switchMode}>
      {mode === "login" ? <LoginForm /> : <RegisterForm />}
    </AuthShell>
  );
}