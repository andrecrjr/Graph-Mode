"use client";
import React, { useEffect, useRef } from "react";
import { useGraph } from "../hooks/useGraph";
import { useGraphContextData } from "../Context/GraphContext";
import { useFetchGraphData } from "../hooks/useFetchGraphData";
import { useParams, useRouter } from "next/navigation";

import LoadingPlaceholder from "./Loading";
import Sidebar from "../Sidebar";
import EditorPage from "../EditorPage";
import { useEditorContext } from "../Context/EditorContext";
import GraphSvg from "./GraphSvg";

export const GraphComponent: React.FC = () => {
  document.body.style.overflow = "hidden";
  const { id: pageId } = useParams();
  const pageUID = pageId as string;
  const { dispatch } = useGraphContextData();
  const { editorDispatch } = useEditorContext();
  const router = useRouter();
  if (!pageId) {
    router.push("/");
  }

  const { data: graphData, loading, error } = useFetchGraphData(pageUID);

  useEffect(() => {
    if (graphData) {
      editorDispatch({ payload: { pageId: pageUID }, type: "SET_PAGE_ID" });
      dispatch({ payload: graphData, type: "SET_NODES" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphData]);

  return (
    <div className="graph overflow-hidden max-w-screen">
      {loading && <LoadingPlaceholder />}
      <Sidebar />
      <GraphSvg pageUID={pageUID} />
      <EditorPage />
    </div>
  );
};

export default GraphComponent;
