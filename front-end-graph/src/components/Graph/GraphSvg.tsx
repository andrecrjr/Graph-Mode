"use client";
import React, { useEffect, useRef } from "react";
import { useGraphContextData } from "../Context/GraphContext";
import { useGraph } from "../hooks/useGraph";
import { useEditorContext } from "../Context/EditorContext";

type Props = {
  pageUID?: string;
};
export default function GraphSvg({ pageUID }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const {
    state: { pageId },
  } = useEditorContext();
  const {
    state: { nodes },
  } = useGraphContextData();
  const { mountGraph } = useGraph();

  useEffect(() => {
    if (nodes && nodes.links) {
      mountGraph(nodes, svgRef);
    }
  }, [nodes, mountGraph, pageId]);

  return <svg ref={svgRef} className="dark:bg-black cursor-move"></svg>;
}
