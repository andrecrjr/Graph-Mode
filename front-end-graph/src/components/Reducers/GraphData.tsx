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
  isVip: boolean;
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
  | { type: "SET_IS_VIP"; payload: boolean }
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
  isVip: false,
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
      const existingNodes = state.nodes?.nodes ?? [];
      const existingLinks = state.nodes?.links ?? [];

      // Filter out duplicate nodes
      const newUniqueNodes = action.payload.nodes.filter(
        newNode => !existingNodes.some(existingNode => existingNode.id === newNode.id)
      );

      // Filter out duplicate links
      const newUniqueLinks = action.payload.links.filter(
        newLink => !existingLinks.some(existingLink =>
          existingLink.source === newLink.source && existingLink.target === newLink.target
        )
      );

      return {
        ...state,
        nodes: {
          nodes: [...existingNodes, ...newUniqueNodes],
          links: [...existingLinks, ...newUniqueLinks],
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
    case "SET_IS_VIP":
      return {
        ...state,
        isVip: action.payload,
      };
    default:
      return state;
  }
}
