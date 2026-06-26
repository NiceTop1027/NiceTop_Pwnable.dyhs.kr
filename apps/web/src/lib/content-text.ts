type BlockNode = {
  content?: Array<{ text?: string }>;
  children?: BlockNode[];
};

export function parseStoredBlocks(content: unknown): BlockNode[] | null {
  if (Array.isArray(content)) return content as BlockNode[];
  if (typeof content !== "string") return null;

  const text = content.trim();
  if (!text.startsWith("[") && !text.startsWith("{")) return null;

  try {
    const parsed = JSON.parse(text) as unknown;
    return Array.isArray(parsed) ? (parsed as BlockNode[]) : null;
  } catch {
    return null;
  }
}

function collectBlockText(blocks: BlockNode[], parts: string[]) {
  for (const block of blocks) {
    if (Array.isArray(block.content)) {
      for (const item of block.content) {
        if (item?.text) parts.push(item.text);
      }
    }
    if (Array.isArray(block.children) && block.children.length > 0) {
      collectBlockText(block.children, parts);
    }
  }
}

/** BlockNote JSON·일반 문자열에서 읽을 수 있는 본문만 추출 (서버/클라이언트 공용) */
export function contentToPlainText(content: unknown): string {
  const blocks = parseStoredBlocks(content);
  if (blocks) {
    const parts: string[] = [];
    collectBlockText(blocks, parts);
    return parts.join(" ").replace(/\s+/g, " ").trim();
  }

  if (typeof content === "string") return content.replace(/\s+/g, " ").trim();
  return "";
}