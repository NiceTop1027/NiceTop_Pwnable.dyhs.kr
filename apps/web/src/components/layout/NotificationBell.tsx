"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, type NotificationItem, type NotificationSummary } from "@/lib/api";
import {
  getGuestNoticeReadAt,
  markGuestNoticeRead,
  markGuestNoticesReadNow,
} from "@/lib/notification-storage";
import { getAccessToken, useAuth } from "@/providers/AuthProvider";

function applyGuestReadState(summary: NotificationSummary): NotificationSummary {
  const lastReadAt = getGuestNoticeReadAt();
  const items = summary.items.map((item) => ({
    ...item,
    isRead: lastReadAt ? item.publishedAt <= lastReadAt : false,
  }));
  const unreadCount = lastReadAt
    ? items.filter((item) => !item.isRead).length
    : items.length;

  return { unreadCount, items };
}

function formatWhen(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return "방금";
  if (diffHours < 24) return `${diffHours}시간 전`;

  return date.toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  });
}

export function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState<NotificationSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (user) {
        const token = getAccessToken();
        if (!token) return;
        const data = await api.notifications(token);
        setSummary(data);
        return;
      }

      const data = applyGuestReadState(await api.notificationsRecent());
      setSummary(data);
    } catch {
      setSummary({ unreadCount: 0, items: [] });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 60_000);
    return () => window.clearInterval(timer);
  }, [load]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", onPointerDown);
      return () => document.removeEventListener("mousedown", onPointerDown);
    }
  }, [open]);

  async function handleMarkAllRead() {
    if (user) {
      const token = getAccessToken();
      if (!token) return;
      await api.markAllNotificationsRead(token);
    } else {
      markGuestNoticesReadNow();
    }
    await load();
  }

  async function handleItemClick(item: NotificationItem) {
    if (!item.isRead) {
      if (user) {
        const token = getAccessToken();
        if (token) {
          await api.markNotificationRead(token, item.id);
        }
      } else {
        markGuestNoticeRead(item.publishedAt);
      }
      await load();
    }
    setOpen(false);
  }

  const unreadCount = summary?.unreadCount ?? 0;
  const items = summary?.items ?? [];

  return (
    <div ref={rootRef} className="notification-bell">
      <button
        type="button"
        className="notification-bell-trigger"
        onClick={() => {
          setOpen((prev) => !prev);
          if (!open) load();
        }}
        aria-label={`알림${unreadCount > 0 ? `, 읽지 않음 ${unreadCount}개` : ""}`}
        aria-expanded={open}
      >
        <Bell className="h-4 w-4" strokeWidth={1.75} />
        {unreadCount > 0 && (
          <span className="notification-bell-badge">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-bell-panel">
          <div className="notification-bell-header">
            <p className="notification-bell-title">알림</p>
            {unreadCount > 0 && (
              <button
                type="button"
                className="notification-bell-mark-all"
                onClick={handleMarkAllRead}
              >
                모두 읽음
              </button>
            )}
          </div>

          {loading && items.length === 0 ? (
            <p className="notification-bell-empty">불러오는 중...</p>
          ) : items.length > 0 ? (
            <ul className="notification-bell-list">
              {items.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/notices/${item.id}`}
                    className={`notification-bell-item${item.isRead ? "" : " notification-bell-item--unread"}`}
                    onClick={() => handleItemClick(item)}
                  >
                    <span className="notification-bell-item-title">
                      {item.isPinned && (
                        <span className="notification-bell-pin">고정</span>
                      )}
                      {item.title}
                    </span>
                    <span className="notification-bell-item-meta">
                      {formatWhen(item.publishedAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="notification-bell-empty">새 알림이 없습니다</p>
          )}

          <Link
            href="/notices"
            className="notification-bell-footer"
            onClick={() => setOpen(false)}
          >
            공지사항 전체 보기
          </Link>
        </div>
      )}
    </div>
  );
}