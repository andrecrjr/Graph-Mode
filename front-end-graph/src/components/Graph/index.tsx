"use client";
import React, { useEffect } from "react";
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
  const { editorDispatch } = useEditorContext();
  const {
    state: { errorFetchGraph, loadingFetchGraph },
  } = useGraphContextData();
  const router = useRouter();
  if (!pageId) {
    router.push("/");
  }

  const { data: graphData } = useFetchGraphData(pageUID);

  useEffect(() => {
    editorDispatch({ payload: { pageId: pageUID }, type: "SET_PAGE_ID" });
  }, []);

  return (
    <div className="graph overflow-hidden max-w-screen">
      {loadingFetchGraph && <LoadingPlaceholder />}
      <Sidebar />
      <GraphSvg pageUID={pageUID} />
      {pageUID !== "mock" && <EditorPage />}
    </div>
  );
};

export default GraphComponent;
