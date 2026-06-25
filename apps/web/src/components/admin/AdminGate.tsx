"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { isStaff } from "@/lib/api";
import { AdminButton } from "./ui/AdminButton";

export function AdminGate({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && !isStaff(user.role)) {
      router.replace("/");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="admin-gate">
        <div className="admin-loading">
          <span className="admin-spinner" />
          권한 확인 중
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="admin-gate">
        <div className="admin-gate-card">
          <p className="admin-gate-title">로그인이 필요합니다</p>
          <p className="admin-gate-description">
            관리자 페이지는 OWNER · ADMIN 권한이 필요합니다
          </p>
          <div className="admin-gate-actions">
            <AdminButton variant="primary" onClick={() => router.push("/auth/login")}>
              로그인
            </AdminButton>
          </div>
        </div>
      </div>
    );
  }

  if (!isStaff(user.role)) {
    return (
      <div className="admin-gate">
        <div className="admin-gate-card">
          <p className="admin-gate-title">접근 권한이 없습니다</p>
          <p className="admin-gate-description">관리자에게 권한을 요청하세요</p>
          <Link href="/" className="admin-gate-link">
            홈으로
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}