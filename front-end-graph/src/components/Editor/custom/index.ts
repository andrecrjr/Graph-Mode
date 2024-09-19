import { BlockNoteSchema, defaultInlineContentSpecs } from "@blocknote/core";
import { PageMention } from "./inlinePageMention";

export const schema = BlockNoteSchema.create({
  inlineContentSpecs: {
    ...defaultInlineContentSpecs,
    ...{ page: PageMention },
  },
});
