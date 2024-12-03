import { SimulationLinkDatum, SimulationNodeDatum } from "d3";

export interface Node extends SimulationNodeDatum {
  id: string;
  label: string;
  firstParent?: boolean;
  type?: string;
  createdGraph?: boolean;
}

export interface Link extends SimulationLinkDatum<Node> {
  id?: string | number;
  type?: string;
  createdGraph?: boolean;
}
