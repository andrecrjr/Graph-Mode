"use client";

import { Link, Node } from "../../../types/graph";

interface GraphState {
  nodes: {
    nodes?: Node[];
    links?: Link[];
  };
  graphMode: "DRAW" | "WATCH";
}

export interface GraphContextType {
  state: GraphState;
  dispatch: React.Dispatch<Action>;
}

type Action =
  | {
      type: "SET_NODES";
      payload: {
        nodes?: Node[];
        links?: Link[];
      };
    }
  | { type: "SET_GRAPH_MODE"; payload: "DRAW" | "WATCH" };

export const initialState: GraphState = {
  nodes: {},
  graphMode: "WATCH",
};

export function graphReducer(state: GraphState, action: Action): GraphState {
  switch (action.type) {
    case "SET_NODES":
      return {
        ...state,
        nodes: action.payload,
      };
    case "SET_GRAPH_MODE":
      return {
        ...state,
        graphMode: action.payload,
      };
    default:
      return state;
  }
}
