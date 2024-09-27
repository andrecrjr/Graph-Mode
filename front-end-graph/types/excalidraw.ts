// Define types for nodes and links in the graph
export interface NodeExcalidraw {
  id: string;
  x: number;
  y: number;
  label: string;
}

export interface LinkExcalidraw {
  source: string;
  target: string;
}

// Define type for graph data
export interface GraphData {
  nodes: NodeExcalidraw[];
  links: LinkExcalidraw[];
}
