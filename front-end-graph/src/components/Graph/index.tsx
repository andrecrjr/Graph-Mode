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
import DrawingCanvas from "./DrawingCanvas";

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
      mountGraph(graphData, svgRef, pageUID);
      dispatch({ payload: graphData, type: "SET_NODES" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphData]);

  return (
    <div className="graph overflow-hidden max-w-screen">
      {loading && <LoadingPlaceholder />}
      {error && (
        <p>
          Oops sorry there was a problem in server right now, try again later{" "}
          {`:(`}
        </p>
      )}
      <Sidebar />
      <DrawingCanvas svgRef={svgRef} pageId={pageUID} />

      <svg ref={svgRef} className="dark:bg-black cursor-move"></svg>
    </div>
  );
};

export default GraphComponent;
