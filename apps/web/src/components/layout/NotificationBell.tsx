"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, ChevronRight, Megaphone } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
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
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "방금 전";
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;

  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function NotificationSkeleton() {
  return (
    <div className="notification-bell-skeleton" aria-hidden>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="notification-bell-skeleton-row">
          <span className="notification-bell-skeleton-dot" />
          <span className="notification-bell-skeleton-lines">
            <span className="notification-bell-skeleton-line notification-bell-skeleton-line--wide" />
            <span className="notification-bell-skeleton-line" />
          </span>
        </div>
      ))}
    </div>
  );
}

function NotificationRow({
  item,
  onNavigate,
}: {
  item: NotificationItem;
  onNavigate: (item: NotificationItem) => void;
}) {
  return (
    <li>
      <Link
        href={`/notices/${item.id}`}
        className={`notification-bell-item${item.isRead ? "" : " notification-bell-item--unread"}`}
        onClick={() => onNavigate(item)}
      >
        <span
          className={`notification-bell-item-dot${item.isRead ? " notification-bell-item-dot--read" : ""}`}
          aria-hidden
        />
        <span className="notification-bell-item-content">
          <span className="notification-bell-item-top">
            {item.isPinned && <span className="notification-bell-pin">고정</span>}
            <span className="notification-bell-item-title">{item.title}</span>
          </span>
          <span className="notification-bell-item-meta">{formatWhen(item.publishedAt)}</span>
        </span>
        <ChevronRight className="notification-bell-item-chevron" strokeWidth={1.75} aria-hidden />
      </Link>
    </li>
  );
}

export function NotificationBell({ className = "" }: { className?: string }) {
  const panelId = useId();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState<NotificationSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (user) {
        const token = getAccessToken();
        if (!token) return;
        setSummary(await api.notifications(token));
        return;
      }

      setSummary(applyGuestReadState(await api.notificationsRecent()));
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
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
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
    <div ref={rootRef} className={`notification-bell ${className}`.trim()}>
      <button
        ref={triggerRef}
        type="button"
        className={`notification-bell-trigger${open ? " notification-bell-trigger--open" : ""}${unreadCount > 0 ? " notification-bell-trigger--active" : ""}`}
        onClick={() => {
          setOpen((prev) => {
            const next = !prev;
            if (next) load();
            return next;
          });
        }}
        aria-label={`알림${unreadCount > 0 ? `, 읽지 않음 ${unreadCount}개` : ""}`}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <Bell className="notification-bell-icon" strokeWidth={1.75} />
        {unreadCount > 0 && (
          <span className="notification-bell-badge" aria-hidden>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            role="dialog"
            aria-label="알림"
            className="notification-bell-panel"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="notification-bell-header">
              <div className="notification-bell-header-copy">
                <p className="notification-bell-title">알림</p>
                <p className="notification-bell-subtitle">
                  {unreadCount > 0
                    ? `읽지 않은 공지 ${unreadCount}개`
                    : "새 소식을 여기서 확인하세요"}
                </p>
              </div>
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
              <NotificationSkeleton />
            ) : items.length > 0 ? (
              <ul className="notification-bell-list">
                {items.map((item) => (
                  <NotificationRow
                    key={item.id}
                    item={item}
                    onNavigate={handleItemClick}
                  />
                ))}
              </ul>
            ) : (
              <div className="notification-bell-empty">
                <Megaphone className="notification-bell-empty-icon" strokeWidth={1.5} />
                <p className="notification-bell-empty-title">새 알림이 없습니다</p>
                <p className="notification-bell-empty-desc">
                  공지가 올라오면 바로 여기에 표시됩니다
                </p>
              </div>
            )}

            <Link
              href="/notices"
              className="notification-bell-footer"
              onClick={() => setOpen(false)}
            >
              공지사항 전체 보기
              <ChevronRight className="notification-bell-footer-icon" strokeWidth={1.75} />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}