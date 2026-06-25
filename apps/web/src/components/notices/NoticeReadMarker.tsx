"use client";

import { useEffect } from "react";
import { api } from "@/lib/api";
import { markGuestNoticeRead } from "@/lib/notification-storage";
import { useAuth  } from "@/providers/AuthProvider";

export function NoticeReadMarker({
  noticeId,
  publishedAt,
}: {
  noticeId: string;
  publishedAt: string;
}) {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      api.markNotificationRead( noticeId).catch(() => undefined);
      return;
    }

    markGuestNoticeRead(publishedAt);
  }, [noticeId, publishedAt, user]);

  return null;
}