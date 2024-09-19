import { BlockNoteEditor, BlockSchemaFromSpecs } from "@blocknote/core";
import { schema } from "@/components/Editor/custom";

interface EditorState {
  editorDocument?: BlockNoteEditor;
  pageId: string;
  notionKey: string;
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
    };

export const initialState: EditorState = {
  editorDocument: undefined,
  pageId: "",
  notionKey: "",
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
    default:
      return state;
  }
}
