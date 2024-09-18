import {
  Block,
  BlockNoteSchema,
  defaultInlineContentSpecs,
} from "@blocknote/core";
import {
  createReactInlineContentSpec,
  DefaultReactSuggestionItem,
} from "@blocknote/react";
import { Node } from "../../../../types/graph"; // Importando o tipo Node

// Definição do conteúdo inline para Page Mention
export const PageMention = createReactInlineContentSpec(
  {
    type: "page",
    propSchema: {
      id: "string",
      label: "string",
    },
    content: "none", // Não há conteúdo aninhado
  } as const,
  {
    render: (props) => {
      return (
        <a
          href={`https://notion.so/${props.inlineContent.props?.id}`}
          className="underline bg-blue-500"
        >
          {props.inlineContent.props.label}
        </a>
      );
    },
  },
);

export const getMentionMenuItems = (
  editor: typeof schema.BlockNoteEditor,
  nodes: Node[],
): DefaultReactSuggestionItem[] => {
  console.log(nodes);
  return nodes.map((node) => ({
    title: node.label,
    onItemClick: () => {
      editor.insertInlineContent([
        {
          type: "page",
          props: {
            id: node.id,
            label: node.label,
          },
        },
        " ", // Adiciona um espaço após a menção inserida
      ]);
    },
  }));
};

export const schema = BlockNoteSchema.create({
  inlineContentSpecs: {
    ...defaultInlineContentSpecs,
    page: PageMention,
  },
});
