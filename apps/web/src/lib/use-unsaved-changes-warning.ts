"use client";

import { useEffect } from "react";

export const UNSAVED_LEAVE_MESSAGE =
  "저장하지 않은 변경 사항이 있습니다. 페이지를 나가시겠습니까?";

function isSamePageHref(href: string): boolean {
  try {
    const dest = new URL(href, window.location.href);
    return (
      dest.pathname === window.location.pathname &&
      dest.search === window.location.search
    );
  } catch {
    return false;
  }
}

function isInternalHref(href: string): boolean {
  if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }
  if (href.startsWith("/")) return true;
  try {
    return new URL(href, window.location.origin).origin === window.location.origin;
  } catch {
    return false;
  }
}

export function confirmUnsavedLeave(
  message = UNSAVED_LEAVE_MESSAGE,
): boolean {
  return window.confirm(message);
}

export function useUnsavedChangesWarning(
  isDirty: boolean,
  message = UNSAVED_LEAVE_MESSAGE,
) {
  useEffect(() => {
    if (!isDirty) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = message;
    };

    const onClickCapture = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || !isInternalHref(href) || isSamePageHref(href)) return;

      if (!confirmUnsavedLeave(message)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClickCapture, true);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClickCapture, true);
    };
  }, [isDirty, message]);
}