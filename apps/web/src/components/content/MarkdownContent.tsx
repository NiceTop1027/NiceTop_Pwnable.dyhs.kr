"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { resolveMediaUrl } from "@/lib/media";
import { isSafeHref } from "@/lib/safe-url";
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
          a: ({ href, children }) => {
            const safeHref = typeof href === "string" && isSafeHref(href) ? href : null;
            if (!safeHref) return <span>{children}</span>;
            const external = safeHref.startsWith("http");
            return (
              <a
                href={safeHref}
                {...(external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {children}
              </a>
            );
          },
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