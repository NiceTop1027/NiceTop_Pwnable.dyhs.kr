const GUEST_READ_KEY = "pwnable_guest_notice_read_at";

export function getGuestNoticeReadAt(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(GUEST_READ_KEY);
}

export function setGuestNoticeReadAt(iso: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_READ_KEY, iso);
}

export function markGuestNoticesReadNow() {
  setGuestNoticeReadAt(new Date().toISOString());
}

export function markGuestNoticeRead(publishedAt: string) {
  const current = getGuestNoticeReadAt();
  if (!current || publishedAt > current) {
    setGuestNoticeReadAt(publishedAt);
  }
}