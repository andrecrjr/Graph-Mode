"use client";

interface EditorState {
  editorDocument: object;
  pageId: string;
}

export interface EditorContextType {
  state: EditorState;
  dispatch: React.Dispatch<Action>;
}

type Action = {
  type: "SET_EDITOR_UPDATE";
  payload: {
    editorDocument: {};
    pageId: "";
  };
};

export const initialState: EditorState = {
  editorDocument: {},
  pageId: "",
};

export function editorReducer(state: EditorState, action: Action): EditorState {
  switch (action.type) {
    case "SET_EDITOR_UPDATE":
      return {
        ...state,
        editorDocument: action.payload.editorDocument,
      };
    default:
      return state;
  }
}
