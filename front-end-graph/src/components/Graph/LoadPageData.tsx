"use client";
import React, { useEffect } from "react";
import { useFetchGraphData } from "../hooks/useFetchGraphData";
import { useParams, useRouter } from "next/navigation";
import { useEditorContext } from "../Context/EditorContext";
import { useGraphContextData } from "../Context/GraphContext";
import { useToast } from "../hooks/use-toast";
import AuthButton from "../Buttons";

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
  const { toast } = useToast();

  const {
    dispatch: graphDispatch,
    state: { errorFetchGraph },
  } = useGraphContextData();

  useEffect(() => {
    editorDispatch({ payload: { pageId: pageUID }, type: "SET_PAGE_ID" });
    graphDispatch({ payload: pageUID, type: "SET_PAGE_ID" });
  }, []);

  useEffect(() => {
    if (errorFetchGraph) {
      toast({
        title: "Server Error",
        description:
          "We couldn't sync your data from Notion servers. Please check your connection or try again in some minutes.",
        className: "bg-red-800 text-white",
      });
    }
  }, [errorFetchGraph, toast]);

  return <>{children}</>;
}
