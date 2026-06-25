"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { RotateCcw, X, ZoomIn } from "lucide-react";
import { blobToAvatarFile, getCroppedImageBlob } from "@/lib/crop-image";
import "react-easy-crop/react-easy-crop.css";

type AvatarCropModalProps = {
  imageSrc: string;
  fileName: string;
  onConfirm: (file: File) => void;
  onCancel: () => void;
  onError?: (message: string) => void;
};

export function AvatarCropModal({
  imageSrc,
  fileName,
  onConfirm,
  onCancel,
  onError,
}: AvatarCropModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedArea(pixels);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !submitting) onCancel();
    }
    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [onCancel, submitting]);

  async function handleConfirm() {
    if (!croppedArea || submitting) return;

    setSubmitting(true);
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedArea, rotation);
      onConfirm(blobToAvatarFile(blob, fileName));
    } catch {
      onError?.("사진을 처리하지 못했습니다");
      setSubmitting(false);
    }
  }

  if (!mounted) return null;

  const zoomLabel = `${Math.round(zoom * 100)}%`;

  return createPortal(
    <div className="avatar-crop-overlay" role="presentation" onClick={onCancel}>
      <div
        className="avatar-crop-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="avatar-crop-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="avatar-crop-header">
          <div>
            <h2 id="avatar-crop-title" className="avatar-crop-title">
              사진 맞춤 설정
            </h2>
            <p className="avatar-crop-desc">원 안에서 드래그하고, 아래 슬라이더로 확대·회전하세요</p>
          </div>
          <button
            type="button"
            className="avatar-crop-close"
            onClick={onCancel}
            disabled={submitting}
            aria-label="닫기"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="avatar-crop-stage">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            cropShape="round"
            showGrid={false}
            minZoom={1}
            maxZoom={3}
            zoomWithScroll
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
            style={{
              cropAreaStyle: {
                border: "2px solid rgba(255, 255, 255, 0.92)",
                boxShadow: "0 0 0 9999em rgba(0, 0, 0, 0.62)",
              },
            }}
          />
        </div>

        <div className="avatar-crop-controls">
          <label className="avatar-crop-control">
            <span className="avatar-crop-control-label">
              <ZoomIn className="h-4 w-4" strokeWidth={1.5} />
              확대
            </span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="avatar-crop-range"
              aria-label="확대"
            />
            <span className="avatar-crop-control-value">{zoomLabel}</span>
          </label>

          <label className="avatar-crop-control">
            <span className="avatar-crop-control-label">
              <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
              회전
            </span>
            <input
              type="range"
              min={-180}
              max={180}
              step={1}
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="avatar-crop-range"
              aria-label="회전"
            />
            <span className="avatar-crop-control-value">{rotation}°</span>
          </label>
        </div>

        <div className="avatar-crop-actions">
          <button
            type="button"
            className="btn-outline avatar-crop-btn"
            onClick={() => setRotation(0)}
            disabled={submitting || rotation === 0}
          >
            회전 초기화
          </button>
          <button
            type="button"
            className="btn-outline avatar-crop-btn"
            onClick={onCancel}
            disabled={submitting}
          >
            취소
          </button>
          <button
            type="button"
            className="btn-fill avatar-crop-btn"
            onClick={() => void handleConfirm()}
            disabled={submitting || !croppedArea}
          >
            {submitting ? "적용 중…" : "적용"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}