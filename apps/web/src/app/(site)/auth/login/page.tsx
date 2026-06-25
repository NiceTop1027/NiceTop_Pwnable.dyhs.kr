import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { AuthShell } from "@/components/auth/AuthShell";

export const metadata = {
  title: "로그인",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="다시 오신 것을 환영합니다"
      description="로그인하고 강의 · 워게임 · CTF를 이어가세요"
      footer={
        <p>
          계정이 없으신가요?{" "}
          <Link href="/auth/register" className="auth-footer-link">
            회원가입
          </Link>
        </p>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}