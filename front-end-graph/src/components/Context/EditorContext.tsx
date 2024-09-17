"use client";
import React, { createContext, useContext, useReducer } from "react";
import {
  EditorContextType,
  editorReducer,
  initialState,
} from "../Reducers/EditorReducer";

export const EditorContext = createContext<EditorContextType>({
  state: initialState,
  editorDispatch: () => null,
});

export const EditorProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(editorReducer, initialState);
  return (
    <EditorContext.Provider value={{ state, editorDispatch: dispatch }}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditorContext = () => {
  const { state, editorDispatch } = useContext(EditorContext);
  return { state, editorDispatch };
};
