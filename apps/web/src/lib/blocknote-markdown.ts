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

const UPLOAD_URL_PATTERN = /^\/(?:api\/)?uploads\//;

function isUploadUrl(url: string | undefined): url is string {
  return Boolean(url && (UPLOAD_URL_PATTERN.test(url) || url.includes("/uploads/content/")));
}

function fileNameFromUrl(url: string) {
  const segment = url.split("/").filter(Boolean).pop();
  return segment ? decodeURIComponent(segment) : "file";
}

function extractUploadLink(
  block: PartialBlock,
): { name: string; url: string; caption?: string } | null {
  if (block.type !== "paragraph" || !Array.isArray(block.content)) return null;

  const items = block.content;
  if (items.length !== 1) return null;

  const item = items[0] as {
    type?: string;
    href?: string;
    text?: string;
    content?: Array<{ type?: string; text?: string }>;
  };

  if (item.type !== "link" || !isUploadUrl(item.href)) return null;

  const linkText =
    item.content?.map((part) => part.text ?? "").join("") ||
    item.text ||
    fileNameFromUrl(item.href!);

  const props = (block.props ?? {}) as Record<string, unknown>;

  return {
    name: linkText,
    url: item.href!,
    caption: typeof props.caption === "string" ? props.caption : "",
  };
}

function normalizeEditorBlock(block: PartialBlock): PartialBlock {
  if (block.type === "file") {
    const props = (block.props ?? {}) as Record<string, unknown>;
    const url = typeof props.url === "string" ? props.url : "";
    const name =
      typeof props.name === "string" && props.name
        ? props.name
        : fileNameFromUrl(url);

    return {
      ...block,
      type: "file",
      props: {
        backgroundColor: "default",
        name,
        url,
        caption: typeof props.caption === "string" ? props.caption : "",
        showPreview: props.showPreview === true,
      },
    } as PartialBlock;
  }

  const uploadLink = extractUploadLink(block);
  if (uploadLink) {
    return {
      id: block.id,
      type: "file",
      props: {
        backgroundColor: "default",
        name: uploadLink.name,
        url: uploadLink.url,
        caption: uploadLink.caption ?? "",
        showPreview: false,
      },
      children: [],
    } as PartialBlock;
  }

  if (Array.isArray(block.children) && block.children.length > 0) {
    return {
      ...block,
      children: block.children.map((child) =>
        normalizeEditorBlock(child as PartialBlock),
      ),
    };
  }

  return block;
}

export function normalizeEditorBlocks(blocks: PartialBlock[]): PartialBlock[] {
  return blocks.map(normalizeEditorBlock);
}

export function parseContentToBlocks(content: unknown): PartialBlock[] {
  const stored = parseStoredBlocks(content);
  if (stored?.length) {
    return normalizeEditorBlocks(stored as PartialBlock[]);
  }

  if (typeof content === "string") {
    return parseMarkdownToBlocks(content);
  }

  return [{ type: "paragraph", content: "" }];
}

export function parseMarkdownToBlocks(markdown: string): PartialBlock[] {
  const text = markdown.trim();
  if (!text) {
    return [{ type: "paragraph", content: "" }];
  }

  try {
    if (text.startsWith("[") || text.startsWith("{")) {
      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          return normalizeEditorBlocks(parsed as PartialBlock[]);
        }
      } catch {
        // fall through to markdown parsing
      }
    }

    const blocks = editor().tryParseMarkdownToBlocks(text);
    return normalizeEditorBlocks(
      blocks.length > 0 ? blocks : [{ type: "paragraph", content: text }],
    );
  } catch {
    return [{ type: "paragraph", content: text }];
  }
}

export function blocksToMarkdown(blocks: PartialBlock[]): string {
  if (!blocks.length) return "";
  return editor().blocksToMarkdownLossy(blocks);
}

/** 문자열·BlockNote JSON을 Markdown 문자열로 통일 */
export function normalizeContentToMarkdown(content: unknown): string {
  const blocks = parseStoredBlocks(content);

  if (blocks && blocks.length > 0) {
    return blocksToMarkdown(blocks as PartialBlock[]);
  }

  if (typeof content === "string") return content;
  return "";
}

/** 저장용: 첨부 파일 메타를 유지하려면 JSON 문자열 사용 */
export function serializeEditorBlocks(blocks: PartialBlock[]): string {
  return JSON.stringify(normalizeEditorBlocks(blocks ?? []));
}

export function hasStoredBlocks(content: unknown): boolean {
  return Boolean(parseStoredBlocks(content)?.length);
}