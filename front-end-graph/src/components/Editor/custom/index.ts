import {
  BlockNoteSchema,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
} from "@blocknote/core";
import { PageMention } from "./inlinePageMention";

export const schema = BlockNoteSchema.create({
  inlineContentSpecs: {
    ...defaultInlineContentSpecs,
    ...{ pageMention: PageMention },
  },
  blockSpecs: {
    ...defaultBlockSpecs,
  },
});
