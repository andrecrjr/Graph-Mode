"use client";

import { Link, Node } from "../../../types/graph";

interface GraphState {
  nodes: {
    nodes?: Node[];
    links?: Link[];
  };
  graphMode: "DRAW" | "WATCH";
  LOCAL_SETTINGS: {
    MAX_GRAPH_WIDTH: 6000;
    MAX_GRAPH_HEIGHT: 6000;
    RESPONSE_BREAKPOINT: 600;
    WINDOW_WIDTH: number;
    WINDOW_HEIGHT: number;
    GRAPH_BALL_SIZE: { sm: 10; lg: 15; master: 22 };
    GRAPH_BALL_LABEL_MARGIN: { sm: -35; lg: -45; master: -55 };
  };
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
  LOCAL_SETTINGS: {
    MAX_GRAPH_WIDTH: 6000,
    MAX_GRAPH_HEIGHT: 6000,
    RESPONSE_BREAKPOINT: 600,
    WINDOW_WIDTH: window.innerWidth,
    WINDOW_HEIGHT: window.innerHeight,
    GRAPH_BALL_SIZE: { sm: 10, lg: 15, master: 22 },
    GRAPH_BALL_LABEL_MARGIN: { sm: -35, lg: -45, master: -55 },
  },
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
