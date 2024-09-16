"use client";
import React, { useEffect, useRef } from "react";
import { useGraph } from "../hooks/useGraph";
import { useGraphContextData } from "./GraphContext";
import { useFetchGraphData } from "../hooks/useFetchGraphData";
import { useParams, useRouter } from "next/navigation";

import LoadingPlaceholder from "./Loading";
import Sidebar from "../Sidebar";
import { PenIcon } from "lucide-react";
import { Button } from "../ui/button";
import MarkDownPage from "../Markdown";

export const GraphComponent: React.FC = () => {
  document.body.style.overflow = "hidden";
  const { id: pageId } = useParams();
  const pageUID = pageId as string;
  const { state, dispatch } = useGraphContextData();
  const router = useRouter();
  if (!pageId) {
    router.push("/");
  }
  const svgRef = useRef<SVGSVGElement | null>(null);

  const { data: graphData, loading, error } = useFetchGraphData(pageUID);
  const { mountGraph } = useGraph();

  useEffect(() => {
    if (graphData) {
      dispatch({ payload: graphData, type: "SET_NODES" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphData]);

  useEffect(() => {
    if (state.nodes.nodes && state.nodes.links)
      mountGraph(state.nodes, svgRef, pageUID);
  }, [state.nodes, mountGraph, pageUID]);

  return (
    <div className="graph overflow-hidden max-w-screen">
      {loading && <LoadingPlaceholder />}
      <Sidebar />
      <svg ref={svgRef} className="dark:bg-black cursor-move"></svg>
      <MarkDownPage />
    </div>
  );
};

export default GraphComponent;
