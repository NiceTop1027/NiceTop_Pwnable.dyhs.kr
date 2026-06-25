"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AtSign, Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/providers/AuthProvider";
import { ApiError } from "@/lib/api";
import {
  translateApiError,
  validateEmail,
  validatePassword,
  validateUsername,
} from "@/lib/auth-validation";
import { AuthField } from "@/components/auth/AuthField";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { PasswordStrength } from "@/components/auth/PasswordStrength";

export function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({
    username: false,
    displayName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [values, setValues] = useState({
    username: "",
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  function validateConfirmPassword(value: string): string | null {
    if (!value) return "비밀번호 확인을 입력해 주세요";
    if (value !== values.password) return "비밀번호가 일치하지 않습니다";
    return null;
  }

  const fieldErrors = {
    username: touched.username ? validateUsername(values.username) : null,
    displayName: null,
    email: touched.email ? validateEmail(values.email) : null,
    password: touched.password ? validatePassword(values.password) : null,
    confirmPassword: touched.confirmPassword
      ? validateConfirmPassword(values.confirmPassword)
      : null,
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setTouched({
      username: true,
      displayName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    const usernameError = validateUsername(values.username);
    const emailError = validateEmail(values.email);
    const passwordError = validatePassword(values.password);
    const confirmError = validateConfirmPassword(values.confirmPassword);

    if (usernameError || emailError || passwordError || confirmError) return;

    setLoading(true);

    try {
      await register({
        username: values.username,
        password: values.password,
        email: values.email || undefined,
        displayName: values.displayName || undefined,
      });
      router.push("/profile");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? translateApiError(err.message)
          : "회원가입에 실패했습니다";
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
        placeholder="영문, 숫자, 밑줄(_)"
        hint="3~20자 · 영문, 숫자, 밑줄(_)만 사용"
        icon={<User className="h-4 w-4" strokeWidth={1.5} />}
        value={values.username}
        error={fieldErrors.username}
        onChange={(e) => setValues((v) => ({ ...v, username: e.target.value }))}
        onBlur={() => setTouched((t) => ({ ...t, username: true }))}
      />

      <AuthField
        label="닉네임"
        name="displayName"
        type="text"
        autoComplete="nickname"
        placeholder="표시 이름 (선택)"
        icon={<AtSign className="h-4 w-4" strokeWidth={1.5} />}
        value={values.displayName}
        onChange={(e) => setValues((v) => ({ ...v, displayName: e.target.value }))}
      />

      <AuthField
        label="이메일"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="email@example.com (선택)"
        icon={<Mail className="h-4 w-4" strokeWidth={1.5} />}
        value={values.email}
        error={fieldErrors.email}
        onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
        onBlur={() => setTouched((t) => ({ ...t, email: true }))}
      />

      <div>
        <AuthField
          label="비밀번호"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="8자 이상"
          icon={<Lock className="h-4 w-4" strokeWidth={1.5} />}
          value={values.password}
          error={fieldErrors.password}
          onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
        />
        <PasswordStrength password={values.password} />
      </div>

      <AuthField
        label="비밀번호 확인"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        placeholder="비밀번호 다시 입력"
        icon={<Lock className="h-4 w-4" strokeWidth={1.5} />}
        value={values.confirmPassword}
        error={fieldErrors.confirmPassword}
        onChange={(e) =>
          setValues((v) => ({ ...v, confirmPassword: e.target.value }))
        }
        onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))}
      />

      <Button
        variant="fill"
        type="submit"
        className="auth-submit"
        disabled={loading}
      >
        {loading ? (
          <span className="auth-submit-loading">
            <span className="auth-spinner" />
            가입 중…
          </span>
        ) : (
          "회원가입"
        )}
      </Button>
    </form>
  );
}