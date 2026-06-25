import {
  createHighlighter,
  type BundledLanguage,
  type Highlighter,
} from "shiki";

export const CODE_HIGHLIGHT_THEME = "github-dark";

type CodeLanguageSpec = {
  name: string;
  aliases?: string[];
};

export const SUPPORTED_CODE_LANGUAGES: Record<string, CodeLanguageSpec> = {
  text: { name: "Plain Text" },
  python: { name: "Python", aliases: ["py"] },
  javascript: { name: "JavaScript", aliases: ["js"] },
  typescript: { name: "TypeScript", aliases: ["ts"] },
  c: { name: "C" },
  cpp: { name: "C++", aliases: ["c++"] },
  bash: { name: "Bash", aliases: ["sh", "shell"] },
  rust: { name: "Rust", aliases: ["rs"] },
  java: { name: "Java" },
  go: { name: "Go", aliases: ["golang"] },
  sql: { name: "SQL" },
  json: { name: "JSON" },
  yaml: { name: "YAML", aliases: ["yml"] },
  html: { name: "HTML" },
  css: { name: "CSS" },
  asm: { name: "Assembly", aliases: ["assembly", "nasm"] },
};

const SHIKI_LANGS = Object.keys(SUPPORTED_CODE_LANGUAGES).filter(
  (lang) => lang !== "text",
);

let highlighterPromise: Promise<Highlighter> | null = null;

export function createShikiHighlighter() {
  return createHighlighter({
    themes: [CODE_HIGHLIGHT_THEME],
    langs: [...SHIKI_LANGS],
  });
}

function getHighlighter() {
  highlighterPromise ??= createShikiHighlighter();
  return highlighterPromise;
}

export function normalizeCodeLanguage(className?: string): string {
  if (!className) return "text";

  const match = className.match(/language-(\S+)/);
  if (!match) return "text";

  const raw = match[1].toLowerCase();
  const resolved = Object.entries(SUPPORTED_CODE_LANGUAGES).find(
    ([id, { aliases }]) => id === raw || aliases?.includes(raw),
  );

  return resolved?.[0] ?? raw;
}

export async function highlightCode(
  code: string,
  language: string,
): Promise<string> {
  const highlighter = await getHighlighter();
  const lang = language === "text" ? "text" : language;

  if (
    lang !== "text" &&
    !highlighter.getLoadedLanguages().includes(lang)
  ) {
    await highlighter.loadLanguage(lang as BundledLanguage);
  }

  return highlighter.codeToHtml(code, {
    lang,
    theme: CODE_HIGHLIGHT_THEME,
    structure: "inline",
  });
}