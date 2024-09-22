import {
  createReactInlineContentSpec,
  DefaultReactSuggestionItem,
} from "@blocknote/react";
import { Node } from "../../../../types/graph"; // Importando o tipo Node
import { schema } from ".";

export const PageMention = createReactInlineContentSpec(
  {
    type: "pageMention",
    propSchema: {
      id: {
        default: "",
      },
      label: {
        default: "",
      },
    },
    content: "none",
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
  return nodes.map((node) => ({
    title: node.label,
    onItemClick: () => {
      editor.insertInlineContent([
        {
          type: "pageMention",
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
