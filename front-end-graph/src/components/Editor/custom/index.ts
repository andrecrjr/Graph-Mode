import {
  BlockNoteEditor,
  BlockNoteSchema,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
} from "@blocknote/core";
import { PageMention } from "./inlinePageMention";
import { codeBlock, insertCodeBlock } from "./codeBlock";
import {
  DefaultReactSuggestionItem,
  getDefaultReactSlashMenuItems,
} from "@blocknote/react";

export const schema = BlockNoteSchema.create({
  inlineContentSpecs: {
    ...defaultInlineContentSpecs,
    ...{ pageMention: PageMention },
  },
  blockSpecs: {
    ...defaultBlockSpecs,
    codeBlock: codeBlock,
  },
});

export const getCustomSlashMenuItems = (
  editor: BlockNoteEditor,
): DefaultReactSuggestionItem[] => [
  ...getDefaultReactSlashMenuItems(editor),
  insertCodeBlock(editor),
];
