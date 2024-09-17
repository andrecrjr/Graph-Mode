"use client";
import React, { createContext, useContext, useReducer } from "react";
import {
  GraphContextType,
  graphReducer,
  initialState,
} from "../Reducers/GraphData";

export const GraphContext = createContext<GraphContextType>({
  state: initialState,
  dispatch: () => null,
});

export const GraphContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(graphReducer, initialState);

  return (
    <GraphContext.Provider value={{ state, dispatch }}>
      {children}
    </GraphContext.Provider>
  );
};

export const useGraphContextData = () => {
  const { state, dispatch } = useContext(GraphContext);
  return { state, dispatch };
};
