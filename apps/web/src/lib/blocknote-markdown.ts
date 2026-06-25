"use client";

import { BlockNoteEditor, type PartialBlock } from "@blocknote/core";

let helperEditor: BlockNoteEditor | null = null;

function editor() {
  if (!helperEditor) {
    helperEditor = BlockNoteEditor.create();
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