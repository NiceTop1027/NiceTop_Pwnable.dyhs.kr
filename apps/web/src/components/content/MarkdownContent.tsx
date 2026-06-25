"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { resolveMediaUrl } from "@/lib/media";
import { HighlightedCodeBlock } from "./HighlightedCodeBlock";

export function MarkdownContent({ content }: { content: string }) {
  if (!content.trim()) return null;

  return (
    <div className="doc-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre: ({ children, className }) => (
            <HighlightedCodeBlock className={className}>
              {children}
            </HighlightedCodeBlock>
          ),
          img: ({ src, alt }) => {
            const resolved = resolveMediaUrl(
              typeof src === "string" ? src : undefined,
            );
            if (!resolved) return null;
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolved}
                alt={alt ?? ""}
                className="doc-image"
                loading="lazy"
                decoding="async"
              />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}