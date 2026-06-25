"use client";

import { isValidElement, useEffect, useState, type ReactNode } from "react";
import { highlightCode, normalizeCodeLanguage } from "@/lib/code-highlight";

type HighlightedCodeBlockProps = {
  children?: ReactNode;
  className?: string;
};

function extractCode(children?: ReactNode): {
  code: string;
  language: string;
} {
  const child = Array.isArray(children) ? children[0] : children;

  if (!isValidElement<{ className?: string; children?: ReactNode }>(child)) {
    return { code: "", language: "text" };
  }

  const code =
    typeof child.props.children === "string"
      ? child.props.children.replace(/\n$/, "")
      : "";

  return {
    code,
    language: normalizeCodeLanguage(child.props.className),
  };
}

export function HighlightedCodeBlock({
  children,
  className,
}: HighlightedCodeBlockProps) {
  const { code, language } = extractCode(children);
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    highlightCode(code, language)
      .then((result) => {
        if (!cancelled) setHtml(result);
      })
      .catch(() => {
        if (!cancelled) setHtml(null);
      });

    return () => {
      cancelled = true;
    };
  }, [code, language]);

  return (
    <pre className={className ? `${className} doc-code-block` : "doc-code-block"}>
      {html ? (
        <code
          className={`language-${language}`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <code className={`language-${language}`}>{code}</code>
      )}
    </pre>
  );
}