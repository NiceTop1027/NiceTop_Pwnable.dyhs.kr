"use client";

import { BlockNoteEditor, type PartialBlock } from "@blocknote/core";
import { parseStoredBlocks } from "./content-text";
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
    // If stored content is a JSON-serialized BlockNote array, parse and return it directly
    if (text.startsWith("[") || text.startsWith("{")) {
      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) return parsed as PartialBlock[];
      } catch {
        // fall through to markdown parsing
      }
    }

    const blocks = editor().tryParseMarkdownToBlocks(text);
    return blocks.length > 0 ? blocks : [{ type: "paragraph", content: text }];
  } catch {
    return [{ type: "paragraph", content: text }];
  }
}

export function blocksToMarkdown(blocks: PartialBlock[]): string {
  if (!blocks.length) return "";
  // For backwards compatibility we still provide a markdown serializer.
  // Caller can choose to stringify the raw blocks when saving to preserve attachments.
  return editor().blocksToMarkdownLossy(blocks);
}

/** 문자열·BlockNote JSON을 Markdown 문자열로 통일 */
export function normalizeContentToMarkdown(content: unknown): string {
  const blocks =
    parseStoredBlocks(content) ??
    (Array.isArray(content) ? (content as PartialBlock[]) : null);

  if (blocks && blocks.length > 0) {
    return blocksToMarkdown(blocks as PartialBlock[]);
  }

  if (typeof content === "string") return content;
  return "";
}