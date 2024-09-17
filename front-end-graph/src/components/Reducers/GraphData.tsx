"use client";

import { Link, Node } from "../../../types/graph";

interface GraphState {
  nodes: {
    nodes?: Node[];
    links?: Link[];
  };
  loadingFetchGraph: boolean;
  errorFetchGraph: boolean;
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
  | { type: "SET_GRAPH_MODE"; payload: "DRAW" | "WATCH" }
  | {
      type: "UPDATE_NODES";
      payload: {
        nodes: Node[];
        links: Link[];
      };
    }
  | {
      type: "ERROR_GRAPH";
      payload: boolean;
    }
  | {
      type: "LOADED_GRAPH";
      payload: boolean;
    };

export const initialState: GraphState = {
  nodes: {
    nodes: [],
    links: [],
  },
  graphMode: "WATCH",
  loadingFetchGraph: true,
  errorFetchGraph: false,
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
    case "UPDATE_NODES":
      return {
        ...state,
        nodes: {
          nodes: [...(state.nodes?.nodes ?? []), ...action.payload.nodes],
          links: [...(state.nodes?.links ?? []), ...action.payload.links],
        },
      };

    case "ERROR_GRAPH":
      return {
        ...state,
        errorFetchGraph: action.payload,
      };
    case "LOADED_GRAPH":
      return {
        ...state,
        loadingFetchGraph: action.payload,
      };
    default:
      return state;
  }
}
