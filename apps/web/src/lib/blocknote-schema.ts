import {
  BlockNoteSchema,
  createCodeBlockSpec,
  defaultBlockSpecs,
} from "@blocknote/core";
import {
  createShikiHighlighter,
  SUPPORTED_CODE_LANGUAGES,
} from "./code-highlight";

export const documentBlockNoteSchema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    codeBlock: createCodeBlockSpec({
      defaultLanguage: "text",
      supportedLanguages: SUPPORTED_CODE_LANGUAGES,
      createHighlighter: createShikiHighlighter,
    }),
  },
});