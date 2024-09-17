"use client";
import React, { useEffect, useRef } from "react";
import { useFetchGraphData } from "../hooks/useFetchGraphData";
import { useGraphContextData } from "../Context/GraphContext";
import { useGraph } from "../hooks/useGraph";

type Props = {
  pageUID: string;
};
export default function GraphSvg({ pageUID }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const { state } = useGraphContextData();
  const { mountGraph } = useGraph();
  useEffect(() => {
    if (state.nodes.nodes && state.nodes.links) {
      mountGraph(state.nodes, svgRef, pageUID);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.nodes, mountGraph, pageUID]);
  return <svg ref={svgRef} className="dark:bg-black cursor-move"></svg>;
}
