"use client";

import type { PartialBlock } from "@blocknote/core";
import { ArrowLeft, Check, ExternalLink, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { NotionEditor } from "./notion/NotionEditor";

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
  footer?: ReactNode;
  showBackLink?: boolean;
};

function SaveStatus({
  saveState,
  isDirty,
}: {
  saveState: SaveState;
  isDirty: boolean;
}) {
  if (saveState === "saving") {
    return (
      <span className="notion-status notion-status--saving">
        <Loader2 className="h-3 w-3 animate-spin" />
        저장 중
      </span>
    );
  }
  if (saveState === "saved") {
    return (
      <span className="notion-status notion-status--saved">
        <Check className="h-3 w-3" />
        저장됨
      </span>
    );
  }
  if (saveState === "error") {
    return <span className="notion-status notion-status--error">저장 실패</span>;
  }
  if (isDirty) {
    return <span className="notion-status notion-status--dirty">수정됨</span>;
  }
  return null;
}

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
  footer,
  showBackLink = true,
}: DocumentEditorShellProps) {
  if (loading) {
    return (
      <div className="notion-page">
        <div className="notion-ambient" aria-hidden />
        <div className="notion-loading">
          <span className="admin-spinner" />
          <span>{loadingMessage}</span>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="notion-page">
        <div className="notion-ambient" aria-hidden />
        <header className="notion-toolbar">
          <Link href={backHref} className="notion-toolbar-back">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            목록
          </Link>
        </header>
        <p className="notion-empty">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="notion-page">
      <div className="notion-ambient" aria-hidden />

      <header className="notion-toolbar">
        <div className="notion-toolbar-start">
          {showBackLink && (
            <Link href={backHref} className="notion-toolbar-back">
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
              목록
            </Link>
          )}
          <SaveStatus saveState={saveState} isDirty={isDirty} />
        </div>

        <div className="notion-toolbar-actions">
          {toolbar && <div className="notion-toolbar-meta">{toolbar}</div>}

          <div className="notion-toolbar-cta">
            {previewHref && (
              <Link
                href={previewHref}
                target="_blank"
                className="notion-btn notion-btn-ghost"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                미리보기
              </Link>
            )}

            <button
              type="button"
              className="notion-btn notion-btn-primary"
              onClick={onSave}
              disabled={saveState === "saving"}
            >
              저장
            </button>

            {onDelete && (
              <button
                type="button"
                className="notion-btn notion-btn-danger"
                onClick={onDelete}
                aria-label="삭제"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      <article className="notion-document">
        <header className="notion-doc-header">
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
        </header>

        <div className="notion-shortcuts" aria-label="단축키 안내">
          <span className="notion-shortcut">
            <kbd>/</kbd> 표 · 목록 · 이미지 등 블록
          </span>
          <span className="notion-shortcut">표 셀 선택 시 행·열 추가/삭제</span>
          <span className="notion-shortcut">
            <kbd>:</kbd> 이모지 · 파일 드래그·붙여넣기
          </span>
          <span className="notion-shortcut">
            <kbd>⌘</kbd>+<kbd>S</kbd> 저장
          </span>
        </div>

        <div className="notion-editor-surface">
          <NotionEditor
            key={editorKey}
            initialContent={blocks}
            onChange={onBlocksChange}
          />
        </div>

        {footer}
      </article>
    </div>
  );
}