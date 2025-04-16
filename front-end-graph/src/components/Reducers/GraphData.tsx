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
    type: "MERGE_STREAMED_NODES";
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

    // New action type that properly handles streamed updates
    case "MERGE_STREAMED_NODES": {
      // Get existing nodes and links
      const existingNodes = state.nodes?.nodes ?? [];
      const existingLinks = state.nodes?.links ?? [];

      // Create sets to track existing IDs for quick lookup
      const existingNodeIds = new Set(existingNodes.map(node => node.id));
      const existingLinkKeys = new Set(
        existingLinks.map(link => {
          const source = typeof link.source === 'object' ? link.source.id : link.source;
          const target = typeof link.target === 'object' ? link.target.id : link.target;
          return `${source}:${target}`;
        })
      );

      // Filter out duplicate nodes
      const newNodes = action.payload.nodes.filter(node => !existingNodeIds.has(node.id));

      // Filter out duplicate links
      const newLinks = action.payload.links.filter(link => {
        const source = typeof link.source === 'object' ? link.source.id : link.source;
        const target = typeof link.target === 'object' ? link.target.id : link.target;
        const linkKey = `${source}:${target}`;
        return !existingLinkKeys.has(linkKey);
      });

      return {
        ...state,
        nodes: {
          nodes: [...existingNodes, ...newNodes],
          links: [...existingLinks, ...newLinks],
        },
      };
    }

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
    default:
      return state;
  }
}
