"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { getAccessToken } from "@/providers/AuthProvider";
import { AdminBadge } from "./ui/AdminBadge";
import { AdminButton } from "./ui/AdminButton";
import { AdminCard } from "./ui/AdminCard";
import { AdminEmpty } from "./ui/AdminEmpty";
import { AdminRow } from "./ui/AdminRow";

type UserRow = {
  id: string;
  username: string;
  displayName: string | null;
  role: string;
  score: number;
  isActive: boolean;
  _count: { solves: number };
};

const roleBadge: Record<string, "default" | "success" | "warning" | "danger"> = {
  USER: "default",
  MODERATOR: "warning",
  ADMIN: "success",
  OWNER: "success",
};

export function UsersAdminPanel() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const token = getAccessToken();
    if (!token) return;
    setUsers((await adminApi.users(token)) as UserRow[]);
  }

  useEffect(() => {
    load()
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  async function updateRole(id: string, role: string) {
    const token = getAccessToken();
    if (!token) return;
    await adminApi.updateUser(token, id, { role });
    await load();
  }

  async function toggleActive(id: string, isActive: boolean) {
    const token = getAccessToken();
    if (!token) return;
    await adminApi.updateUser(token, id, { isActive: !isActive });
    await load();
  }

  return (
    <AdminCard title="회원 목록" description={`총 ${users.length}명`}>
      {loading ? (
        <div className="admin-loading">
          <span className="admin-spinner" />
          불러오는 중
        </div>
      ) : users.length > 0 ? (
        users.map((u) => (
          <AdminRow
            key={u.id}
            title={u.displayName ?? u.username}
            meta={`@${u.username} · ${u.score.toLocaleString("ko-KR")} XP · ${u._count.solves} solved`}
            badge={
              <>
                <AdminBadge variant={roleBadge[u.role] ?? "default"}>{u.role}</AdminBadge>
                {!u.isActive && <AdminBadge variant="danger">정지</AdminBadge>}
              </>
            }
            actions={
              <>
                <select
                  value={u.role}
                  onChange={(e) => updateRole(u.id, e.target.value)}
                  className="admin-select admin-select-inline"
                  disabled={u.role === "OWNER"}
                  aria-label={`${u.username} 권한`}
                >
                  {["USER", "MODERATOR", "ADMIN", "OWNER"].map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <AdminButton
                  variant={u.isActive ? "ghost" : "primary"}
                  onClick={() => toggleActive(u.id, u.isActive)}
                  disabled={u.role === "OWNER"}
                >
                  {u.isActive ? "정지" : "활성화"}
                </AdminButton>
              </>
            }
          />
        ))
      ) : (
        <AdminEmpty message="등록된 회원이 없습니다" />
      )}
    </AdminCard>
  );
}