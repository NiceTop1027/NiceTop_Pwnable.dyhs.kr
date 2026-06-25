"use client";

import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string | null;
  icon?: ReactNode;
}

export function AuthField({
  label,
  hint,
  error,
  icon,
  type = "text",
  className = "",
  id,
  ...props
}: AuthFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;
  const fieldId = id ?? props.name;

  return (
    <div className="auth-field">
      <label htmlFor={fieldId} className="auth-field-label">
        {label}
      </label>

      <div className={`auth-field-wrap ${error ? "auth-field-wrap-error" : ""}`}>
        {icon && <span className="auth-field-icon">{icon}</span>}

        <input
          id={fieldId}
          type={inputType}
          className={`auth-field-input ${icon ? "auth-field-input-icon" : ""} ${className}`}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined
          }
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            className="auth-field-toggle"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" strokeWidth={1.5} />
            ) : (
              <Eye className="h-4 w-4" strokeWidth={1.5} />
            )}
          </button>
        )}
      </div>

      {error ? (
        <p id={`${fieldId}-error`} className="auth-field-error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${fieldId}-hint`} className="auth-field-hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}