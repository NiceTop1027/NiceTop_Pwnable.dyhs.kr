"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/providers/AuthProvider";
import { ApiError } from "@/lib/api";
import {
  translateApiError,
  validatePassword,
  validateUsername,
} from "@/lib/auth-validation";
import { AuthField } from "@/components/auth/AuthField";
import { AuthAlert } from "@/components/auth/AuthAlert";

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ username: false, password: false });
  const [values, setValues] = useState({ username: "", password: "" });

  useEffect(() => {
    if (sessionStorage.getItem("pwnable_account_suspended") === "1") {
      sessionStorage.removeItem("pwnable_account_suspended");
      setError("계정이 정지되었습니다. 관리자에게 문의해 주세요.");
    }
  }, []);

  const fieldErrors = {
    username: touched.username ? validateUsername(values.username) : null,
    password: touched.password ? validatePassword(values.password) : null,
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setTouched({ username: true, password: true });

    const usernameError = validateUsername(values.username);
    const passwordError = validatePassword(values.password);

    if (usernameError || passwordError) return;

    setLoading(true);

    try {
      await login(values.username, values.password);
      router.push("/profile");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? translateApiError(err.message)
          : "로그인에 실패했습니다";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <AuthAlert message={error} />

      <AuthField
        label="아이디"
        name="username"
        type="text"
        autoComplete="username"
        placeholder="아이디 입력"
        icon={<User className="h-4 w-4" strokeWidth={1.5} />}
        value={values.username}
        error={fieldErrors.username}
        onChange={(e) => setValues((v) => ({ ...v, username: e.target.value }))}
        onBlur={() => setTouched((t) => ({ ...t, username: true }))}
      />

      <AuthField
        label="비밀번호"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="비밀번호 입력"
        icon={<Lock className="h-4 w-4" strokeWidth={1.5} />}
        value={values.password}
        error={fieldErrors.password}
        onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
        onBlur={() => setTouched((t) => ({ ...t, password: true }))}
      />

      <p className="auth-hint">
        로그인 8회 실패 시 15분간 시도가 제한됩니다.
      </p>

      <Button
        variant="fill"
        type="submit"
        className="auth-submit"
        disabled={loading}
      >
        {loading ? (
          <span className="auth-submit-loading">
            <span className="auth-spinner" />
            로그인 중…
          </span>
        ) : (
          "로그인"
        )}
      </Button>
    </form>
  );
}