import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { AuthShell } from "@/components/auth/AuthShell";

export const metadata = {
  title: "회원가입",
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="학습을 시작하세요"
      description="무료로 가입하고 포너블 학습을 시작할 수 있습니다"
      footer={
        <p>
          이미 계정이 있으신가요?{" "}
          <Link href="/auth/login" className="auth-footer-link">
            로그인
          </Link>
        </p>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}