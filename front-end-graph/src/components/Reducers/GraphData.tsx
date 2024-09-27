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
  pageId: string;
  nodePositions: [];
  linkPositions: [];
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
    }
  | {
      type: "SET_PAGE_ID";
      payload: string;
    }
  | {
      type: "SET_COORDINATES";
      payload: {
        nodes: Node[];
        links: Link[];
      };
    };

export const initialState: GraphState = {
  nodes: {
    nodes: [],
    links: [],
  },
  pageId: "mock",
  graphMode: "WATCH",
  loadingFetchGraph: true,
  errorFetchGraph: false,
  nodePositions: [],
  linkPositions: [],
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
    case "SET_PAGE_ID":
      return {
        ...state,
        pageId: action.payload,
      };
    case "SET_COORDINATES":
      return {
        ...state,
        nodePositions: action.payload.nodes, // Store node positions and labels
        linkPositions: action.payload.links, // Store link positions
      };
    default:
      return state;
  }
}
