export interface Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  firstParent?: boolean;
  type?: string;
}

export interface Link {
  id?: string | number;
  source: string;
  target: string;
  type?: string;
}
