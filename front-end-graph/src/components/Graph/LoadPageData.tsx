"use client";
import React, { useEffect } from "react";
import { useFetchGraphData } from "../hooks/useFetchGraphData";
import { useParams, useRouter } from "next/navigation";
import { useGraphContextData } from "../Context/GraphContext";
import useToastNotification from "../hooks/useToastNotification";
import { saveStorage } from "../utils";

export function LoadPageData({ children }: { children: React.ReactNode }) {
  document.body.style.overflow = "hidden";
  const { id: pageId } = useParams();
  const pageUID = pageId as string;
  const router = useRouter();
  if (!pageId) {
    router.push("/app");
  }

  const { dispatch: graphDispatch } = useGraphContextData();

  useToastNotification();
  useFetchGraphData(pageUID);

  useEffect(() => {
    graphDispatch({ payload: pageUID, type: "SET_PAGE_ID" });
    saveStorage.set(
      `title-graph-${pageUID}`,
      globalThis.document.title.replace("- Graph Mode", ""),
    );
  }, []);

  return <>{children}</>;
}
