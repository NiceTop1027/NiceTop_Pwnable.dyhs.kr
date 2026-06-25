import { ko } from "@blocknote/core/locales";

/** 한국어 슬래시 메뉴 검색어를 보강한 BlockNote 사전 */
export const blockNoteDictionary = {
  ...ko,
  slash_menu: {
    ...ko.slash_menu,
    quote: {
      ...ko.slash_menu.quote,
      aliases: [...ko.slash_menu.quote.aliases, "인용", "인용문"],
    },
    divider: {
      ...ko.slash_menu.divider,
      aliases: [...ko.slash_menu.divider.aliases, "구분선", "선", "hr"],
    },
    table: {
      ...ko.slash_menu.table,
      aliases: [...ko.slash_menu.table.aliases, "table", "테이블"],
    },
    code_block: {
      ...ko.slash_menu.code_block,
      aliases: [...ko.slash_menu.code_block.aliases, "코드", "코드블록"],
    },
    image: {
      ...ko.slash_menu.image,
      aliases: [...ko.slash_menu.image.aliases, "사진", "그림"],
    },
    video: {
      ...ko.slash_menu.video,
      aliases: [...ko.slash_menu.video.aliases, "영상", "비디오"],
    },
    audio: {
      ...ko.slash_menu.audio,
      aliases: [...ko.slash_menu.audio.aliases, "소리", "음악"],
    },
    file: {
      ...ko.slash_menu.file,
      aliases: [...ko.slash_menu.file.aliases, "첨부", "문서"],
    },
    emoji: {
      ...ko.slash_menu.emoji,
      aliases: [...ko.slash_menu.emoji.aliases, "이모티콘"],
    },
  },
} as const satisfies typeof ko;