import { Suspense } from "react";
import { AuthPage } from "@/components/auth/AuthPage";
import type { AuthMode } from "@/components/auth/AuthShell";

export const metadata = {
  title: "로그인",
};

type Props = {
  searchParams: Promise<{ tab?: string; next?: string }>;
};

export default async function AuthRoutePage({ searchParams }: Props) {
  const { tab } = await searchParams;
  const initialMode: AuthMode = tab === "register" ? "register" : "login";

  return (
    <Suspense fallback={null}>
      <AuthPage initialMode={initialMode} />
    </Suspense>
  );
}