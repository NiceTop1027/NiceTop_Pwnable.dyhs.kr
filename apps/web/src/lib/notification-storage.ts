const GUEST_READ_KEY = "pwnable_guest_notice_read_at";
const GUEST_BASELINE_KEY = "pwnable_guest_notice_baseline";

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

/** 첫 방문 시점 — 이전에 올라온 공지는 알림 배지에 포함하지 않음 */
export function getGuestNoticeBaseline(): string {
  if (typeof window === "undefined") return new Date().toISOString();

  const existing = localStorage.getItem(GUEST_BASELINE_KEY);
  if (existing) return existing;

  const baseline = new Date().toISOString();
  localStorage.setItem(GUEST_BASELINE_KEY, baseline);
  return baseline;
}