"use client";
import React, { useEffect } from "react";
import { useFetchGraphData } from "../hooks/useFetchGraphData";
import { useParams, useRouter } from "next/navigation";
import { useEditorContext } from "../Context/EditorContext";
import { useGraphContextData } from "../Context/GraphContext";

export function LoadPageData({ children }: { children: React.ReactNode }) {
  document.body.style.overflow = "hidden";

  const { id: pageId } = useParams();
  const pageUID = pageId as string;
  const router = useRouter();
  if (!pageId) {
    router.push("/app");
  }
  // fetch all data and send by GraphDataContext
  useFetchGraphData(pageUID);
  const { editorDispatch } = useEditorContext();
  const { dispatch: graphDispatch } = useGraphContextData();

  useEffect(() => {
    editorDispatch({ payload: { pageId: pageUID }, type: "SET_PAGE_ID" });
    graphDispatch({ payload: pageUID, type: "SET_PAGE_ID" });
  }, []);

  return <>{children}</>;
}
