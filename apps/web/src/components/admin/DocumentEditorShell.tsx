"use client";

import type { PartialBlock } from "@blocknote/core";
import { ArrowLeft, Check, ExternalLink, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { NotionEditor } from "./notion/NotionEditor";
import { AdminButton } from "./ui/AdminButton";

export type SaveState = "idle" | "saving" | "saved" | "error";

type DocumentEditorShellProps = {
  backHref: string;
  title: string;
  onTitleChange: (value: string) => void;
  subtitle?: string;
  onSubtitleChange?: (value: string) => void;
  subtitlePlaceholder?: string;
  titlePlaceholder?: string;
  titleAriaLabel?: string;
  subtitleAriaLabel?: string;
  blocks: PartialBlock[] | null;
  editorKey: number;
  onBlocksChange: (blocks: PartialBlock[]) => void;
  saveState: SaveState;
  isDirty: boolean;
  onSave: () => void;
  onDelete?: () => void;
  previewHref?: string;
  toolbar?: ReactNode;
  emptyMessage?: string;
  notFound?: boolean;
  loading?: boolean;
  loadingMessage?: string;
};

export function DocumentEditorShell({
  backHref,
  title,
  onTitleChange,
  subtitle,
  onSubtitleChange,
  subtitlePlaceholder = "한 줄 설명 (선택)",
  titlePlaceholder = "제목 없음",
  titleAriaLabel = "문서 제목",
  subtitleAriaLabel = "문서 설명",
  blocks,
  editorKey,
  onBlocksChange,
  saveState,
  isDirty,
  onSave,
  onDelete,
  previewHref,
  toolbar,
  emptyMessage = "문서를 찾을 수 없습니다",
  notFound = false,
  loading = false,
  loadingMessage = "문서 불러오는 중",
}: DocumentEditorShellProps) {
  if (loading) {
    return (
      <div className="notion-page">
        <div className="admin-loading">
          <span className="admin-spinner" />
          {loadingMessage}
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="notion-page">
        <div className="notion-toolbar">
          <Link href={backHref} className="notion-toolbar-back">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            목록
          </Link>
        </div>
        <p className="notion-empty">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="notion-page">
      <header className="notion-toolbar">
        <Link href={backHref} className="notion-toolbar-back">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          목록
        </Link>

        <div className="notion-toolbar-actions">
          {toolbar}

          <span className="notion-toolbar-status">
            {saveState === "saving" && (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                저장 중
              </>
            )}
            {saveState === "saved" && (
              <>
                <Check className="h-3.5 w-3.5" />
                저장됨
              </>
            )}
            {saveState === "error" && "저장 실패"}
            {saveState === "idle" && isDirty && "수정됨"}
          </span>

          {previewHref && (
            <Link
              href={previewHref}
              target="_blank"
              className="admin-btn admin-btn-ghost"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              미리보기
            </Link>
          )}

          <AdminButton
            variant="primary"
            onClick={onSave}
            disabled={saveState === "saving"}
          >
            저장
          </AdminButton>

          {onDelete && (
            <AdminButton variant="danger" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5" />
              삭제
            </AdminButton>
          )}
        </div>
      </header>

      <article className="notion-document">
        <input
          className="notion-title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder={titlePlaceholder}
          aria-label={titleAriaLabel}
        />
        {onSubtitleChange && (
          <input
            className="notion-subtitle"
            value={subtitle ?? ""}
            onChange={(e) => onSubtitleChange(e.target.value)}
            placeholder={subtitlePlaceholder}
            aria-label={subtitleAriaLabel}
          />
        )}
        <p className="notion-hint">
          <kbd>/</kbd> 로 블록 추가 · 저장 시 Markdown으로 게시됩니다 ·{" "}
          <kbd>⌘</kbd>+<kbd>S</kbd> 저장
        </p>
        <NotionEditor
          key={editorKey}
          initialContent={blocks}
          onChange={onBlocksChange}
        />
      </article>
    </div>
  );
}