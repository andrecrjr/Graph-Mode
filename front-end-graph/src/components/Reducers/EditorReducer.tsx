import { BlockNoteEditor } from "@blocknote/core";

// Função para gerar um array de objetos {type: "paragraph"}
function generateParagraphs(num: number) {
  const paragraphs = [];
  for (let i = 0; i < num; i++) {
    paragraphs.push({ type: "paragraph", content: [] });
  }
  return paragraphs;
}

// Exemplo de uso
const paragraphsArray = generateParagraphs(25);
interface EditorState {
  editorDocument?: BlockNoteEditor;
  pageId: string;
  notionKey: string;
  initialContentDocument: any[];
}

export interface EditorContextType {
  state: EditorState;
  editorDispatch: React.Dispatch<Action>;
}

type Action =
  | {
      type: "SET_PAGE_ID";
      payload: {
        pageId: string;
      };
    }
  | {
      type: "SET_EDITOR_UPDATE";
      payload: {
        editorDocument: BlockNoteEditor;
      };
    }
  | {
      type: "SET_NOTION_TOKEN";
      payload: {
        notionKey: string;
      };
    }
  | {
      type: "RESET_EDITOR_CONTENT";
    };
export const initialState: EditorState = {
  editorDocument: undefined,
  pageId: "",
  notionKey: "",
  initialContentDocument: [
    {
      type: "heading",
    },
    ...paragraphsArray,
  ],
};

export function editorReducer(state: EditorState, action: Action): EditorState {
  switch (action.type) {
    case "SET_EDITOR_UPDATE":
      return {
        ...state,
        editorDocument: action.payload.editorDocument,
      };
    case "SET_NOTION_TOKEN":
      return {
        ...state,
        notionKey: action.payload.notionKey,
      };
    case "SET_PAGE_ID":
      return {
        ...state,
        pageId: action.payload.pageId,
      };
    case "RESET_EDITOR_CONTENT":
      return {
        ...state,
        initialContentDocument: state.initialContentDocument,
      };
    default:
      return state;
  }
}
