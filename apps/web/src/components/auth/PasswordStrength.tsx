"use client";

import { passwordStrength } from "@/lib/auth-validation";

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const { score, label } = passwordStrength(password);

  return (
    <div className="auth-password-strength">
      <div className="auth-password-bars">
        {[1, 2, 3].map((level) => (
          <span
            key={level}
            className={`auth-password-bar ${
              score >= level ? `auth-password-bar-${score}` : ""
            }`}
          />
        ))}
      </div>
      <span className="auth-password-label">{label}</span>
    </div>
  );
}