"use client";
import React, { useEffect } from "react";
import { useFetchGraphData } from "../hooks/useFetchGraphData";
import { useParams, useRouter } from "next/navigation";
import { useEditorContext } from "../Context/EditorContext";
import { useGraphContextData } from "../Context/GraphContext";
import { useToast } from "../hooks/use-toast";
import AuthButton from "../Buttons";
import useToastNotification from "../hooks/useToastNotification";

export function LoadPageData({ children }: { children: React.ReactNode }) {
  document.body.style.overflow = "hidden";

  const { id: pageId } = useParams();
  const pageUID = pageId as string;
  const router = useRouter();
  if (!pageId) {
    router.push("/app");
  }
  const { editorDispatch } = useEditorContext();

  const { dispatch: graphDispatch } = useGraphContextData();

  useToastNotification();
  useFetchGraphData(pageUID);

  useEffect(() => {
    editorDispatch({ payload: { pageId: pageUID }, type: "SET_PAGE_ID" });
    graphDispatch({ payload: pageUID, type: "SET_PAGE_ID" });
  }, []);

  return <>{children}</>;
}
