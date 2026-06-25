"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import { useAuth, getAccessToken } from "@/providers/AuthProvider";
import { api, ApiError, type AuthUser } from "@/lib/api";
import { resolveAvatarUrl } from "@/lib/avatar";
import { translateApiError } from "@/lib/auth-validation";
import { AvatarCropModal } from "@/components/auth/AvatarCropModal";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
const MAX_BYTES = 2 * 1024 * 1024;

type ProfileAvatarProps = {
  user: AuthUser;
  size?: "hero" | "form";
  onUpdated?: (user: AuthUser) => void;
  onError?: (message: string) => void;
};

export function ProfileAvatar({
  user,
  size = "hero",
  onUpdated,
  onError,
}: ProfileAvatarProps) {
  const { setUser } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [cropSource, setCropSource] = useState<{ src: string; name: string } | null>(
    null,
  );

  useEffect(() => {
    return () => {
      if (cropSource?.src) URL.revokeObjectURL(cropSource.src);
    };
  }, [cropSource]);

  const displayName = user.displayName ?? user.username;
  const initial = displayName.charAt(0).toUpperCase();
  const src = resolveAvatarUrl(user.avatarUrl);

  function reportError(message: string) {
    onError?.(message);
  }

  function applyUser(updated: AuthUser) {
    setUser(updated);
    onUpdated?.(updated);
  }

  function closeCrop() {
    if (cropSource?.src) URL.revokeObjectURL(cropSource.src);
    setCropSource(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleFileSelect(file: File) {
    if (!ACCEPT.split(",").includes(file.type)) {
      return reportError("JPEG, PNG, WebP, GIF만 업로드할 수 있습니다");
    }
    if (file.size > MAX_BYTES) {
      return reportError("파일 크기는 2MB 이하여야 합니다");
    }

    closeCrop();
    setCropSource({ src: URL.createObjectURL(file), name: file.name });
  }

  async function uploadFile(file: File) {
    const token = getAccessToken();
    if (!token) return;

    setLoading(true);
    try {
      const updated = await api.uploadAvatar(token, file);
      applyUser(updated);
    } catch (err) {
      reportError(
        err instanceof ApiError ? translateApiError(err.message) : "업로드 실패",
      );
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleCropConfirm(file: File) {
    closeCrop();
    await uploadFile(file);
  }

  async function handleRemove(e: React.MouseEvent) {
    e.stopPropagation();
    const token = getAccessToken();
    if (!token) return;

    setLoading(true);
    try {
      const updated = await api.deleteAvatar(token);
      applyUser(updated);
    } catch (err) {
      reportError(
        err instanceof ApiError ? translateApiError(err.message) : "삭제 실패",
      );
    } finally {
      setLoading(false);
    }
  }

  const className = [
    "profile-avatar",
    size === "hero" ? "profile-avatar-hero" : "profile-avatar-form",
    loading ? "profile-avatar-loading" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
    <div className={className}>
      <button
        type="button"
        className="profile-avatar-trigger"
        onClick={() => !loading && inputRef.current?.click()}
        disabled={loading}
        aria-label="프로필 사진 변경"
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="profile-avatar-img" />
        ) : (
          <span className="profile-avatar-initial">{initial}</span>
        )}
        <span className="profile-avatar-overlay" aria-hidden>
          <Camera className="h-4 w-4" strokeWidth={1.5} />
        </span>
        {loading && <span className="profile-avatar-spinner" aria-hidden />}
      </button>

      {src && !loading && (
        <button
          type="button"
          className="profile-avatar-remove"
          onClick={handleRemove}
          aria-label="프로필 사진 삭제"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="profile-avatar-input"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
      />
    </div>

    {cropSource && (
      <AvatarCropModal
        imageSrc={cropSource.src}
        fileName={cropSource.name}
        onConfirm={(file) => void handleCropConfirm(file)}
        onCancel={closeCrop}
        onError={reportError}
      />
    )}
    </>
  );
}