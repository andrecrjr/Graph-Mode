"use client";
import React, { useEffect, useRef } from "react";
import { useGraph } from "../hooks/useGraph";
import { useGraphContextData } from "./GraphContext";
import { useFetchGraphData } from "../hooks/useFetchGraphData";
import { useParams, useRouter } from "next/navigation";

import LoadingPlaceholder from "./Loading";
import Sidebar from "../Sidebar";

export const GraphComponent: React.FC = () => {
  document.body.style.overflow = "hidden";
  const { id: pageId } = useParams();
  const pageUID = pageId as string;
  const { setNodes } = useGraphContextData();
  const router = useRouter();
  if (!pageId) {
    router.push("/");
  }
  const svgRef = useRef<SVGSVGElement | null>(null);

  const { data: graphData, loading, error } = useFetchGraphData(pageUID);
  const { mountGraph } = useGraph();

  useEffect(() => {
    if (graphData) {
      mountGraph(graphData, svgRef, pageUID);
      setNodes(graphData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphData]);

  return (
    <div className="graph overflow-hidden max-w-screen">
      {loading && <LoadingPlaceholder />}
      <Sidebar />
      <svg ref={svgRef} className="dark:bg-black cursor-move"></svg>
    </div>
  );
};

export default GraphComponent;
