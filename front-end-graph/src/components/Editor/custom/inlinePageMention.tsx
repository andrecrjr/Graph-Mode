import {
  Block,
  BlockNoteSchema,
  defaultInlineContentSpecs,
  PropSpec,
} from "@blocknote/core";
import {
  createReactInlineContentSpec,
  DefaultReactSuggestionItem,
} from "@blocknote/react";
import { Node } from "../../../../types/graph"; // Importando o tipo Node
import { schema } from ".";

// Definição do conteúdo inline para Page Mention
export const PageMention = createReactInlineContentSpec(
  {
    type: "page",
    propSchema: {
      id: {
        default: "",
      },
      label: {
        default: "",
      },
    },
    content: "none", // Não há conteúdo aninhado
  },
  {
    render: (props) => {
      return (
        <a
          href={`https://notion.so/${props.inlineContent.props?.id}`}
          className="underline"
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
