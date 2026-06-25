"use client";

import { BlockNoteEditor, type PartialBlock } from "@blocknote/core";
import { documentBlockNoteSchema } from "./blocknote-schema";

let helperEditor: BlockNoteEditor | null = null;

function editor() {
  if (!helperEditor) {
    helperEditor = BlockNoteEditor.create({
      schema: documentBlockNoteSchema,
    });
  }
  return helperEditor;
}

export function parseMarkdownToBlocks(markdown: string): PartialBlock[] {
  const text = markdown.trim();
  if (!text) {
    return [{ type: "paragraph", content: "" }];
  }

  try {
    const blocks = editor().tryParseMarkdownToBlocks(text);
    return blocks.length > 0 ? blocks : [{ type: "paragraph", content: text }];
  } catch {
    return [{ type: "paragraph", content: text }];
  }
}

export function blocksToMarkdown(blocks: PartialBlock[]): string {
  if (!blocks.length) return "";
  return editor().blocksToMarkdownLossy(blocks);
}

/** 문자열·레거시 BlockNote JSON을 Markdown 문자열로 통일 */
export function normalizeContentToMarkdown(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content) && content.length > 0) {
    return blocksToMarkdown(content as PartialBlock[]);
  }
  return "";
}