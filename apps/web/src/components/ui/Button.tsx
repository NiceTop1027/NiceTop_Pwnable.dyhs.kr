import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "fill" | "outline" | "text";

interface ButtonProps {
  href?: string;
  variant?: Variant;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}

const variants: Record<Variant, string> = {
  fill: "btn-fill",
  outline: "btn-outline",
  text: "btn-text",
};

export function Button({
  href,
  variant = "fill",
  children,
  className = "",
  onClick,
  type = "button",
  disabled,
}: ButtonProps) {
  const cls = `${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}