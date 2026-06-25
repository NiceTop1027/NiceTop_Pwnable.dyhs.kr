"use client";

import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";

type EditorProps = {
  lectureTitle: string;
  pages: { id: string; title: string; order: number }[];
  activePageId: string;
  onSelectPage: (pageId: string) => void;
  onAddPage: () => void;
  onDeletePage: (pageId: string) => void;
  onRenamePage: (pageId: string, title: string) => void;
  backHref?: string;
  backLabel?: string;
};

export function LecturePageNav({
  lectureTitle,
  pages,
  activePageId,
  onSelectPage,
  onAddPage,
  onDeletePage,
  onRenamePage,
  backHref = "/admin/curriculum",
  backLabel = "목록",
}: EditorProps) {
  return (
    <aside className="lecture-editor-nav">
      <div className="lecture-editor-nav-top">
        <Link href={backHref} className="doc-back">
          <span className="doc-back-icon" aria-hidden>
            ‹
          </span>
          {backLabel}
        </Link>
        <p className="lecture-editor-nav-title">{lectureTitle}</p>
      </div>

      <nav aria-label="페이지">
        <ul className="lecture-editor-nav-list">
          {pages.map((page) => {
            const isActive = page.id === activePageId;

            return (
              <li key={page.id} className="lecture-editor-nav-item">
                <button
                  type="button"
                  className={`lecture-editor-nav-link${isActive ? " lecture-editor-nav-link--active" : ""}`}
                  onClick={() => onSelectPage(page.id)}
                  aria-current={isActive ? "page" : undefined}
                >
                  <input
                    className="lecture-editor-nav-input"
                    value={page.title}
                    onChange={(e) => onRenamePage(page.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label="페이지 제목"
                  />
                </button>
                {pages.length > 1 && (
                  <button
                    type="button"
                    className="lecture-editor-nav-remove"
                    onClick={() => onDeletePage(page.id)}
                    aria-label={`${page.title} 삭제`}
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <button type="button" className="lecture-editor-nav-add" onClick={onAddPage}>
        <Plus className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
        페이지 추가
      </button>
    </aside>
  );
}