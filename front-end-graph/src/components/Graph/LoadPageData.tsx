"use client";
import React, { useEffect, useState } from "react";
import { useFetchGraphData } from "../hooks/useFetchGraphData";
import { useParams, useRouter } from "next/navigation";
import { useEditorContext } from "../Context/EditorContext";
import { useGraphContextData } from "../Context/GraphContext";
import useToastNotification from "../hooks/useToastNotification";
import { saveStorage } from "../utils";
import { useStreamGraphData } from "../hooks/useStreamGraphData";

export function LoadPageData({ children }: { children: React.ReactNode }) {
  document.body.style.overflow = "hidden";
  const { id: pageId } = useParams();
  const pageUID = pageId as string;
  const router = useRouter();
  const [streamInitialized, setStreamInitialized] = useState(false);

  if (!pageId) {
    router.push("/app");
  }

  const { editorDispatch } = useEditorContext();
  const { dispatch: graphDispatch } = useGraphContextData();
  const { isStreaming, progress, startStreaming } = useStreamGraphData(pageUID);

  useToastNotification();

  // Use traditional fetch as a fallback, but prefer streaming for real-time updates
  const { data } = useFetchGraphData(pageUID);

  useEffect(() => {
    editorDispatch({ payload: { pageId: pageUID }, type: "SET_PAGE_ID" });
    graphDispatch({ payload: pageUID, type: "SET_PAGE_ID" });
    saveStorage.set(
      `title-graph-${pageUID}`,
      globalThis.document.title.replace("- Graph Mode", ""),
    );
  }, [editorDispatch, graphDispatch, pageUID]);

  // Separate effect for stream initialization - only runs once after component mounts
  useEffect(() => {
    if (!streamInitialized && pageUID !== "mock") {
      console.log("Initializing stream for page:", pageUID);
      // Wait a moment to let the graph render first
      const timer = setTimeout(() => {
        if (!saveStorage.get(`data-block-${pageUID}`)) {
          startStreaming();
          setStreamInitialized(true);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [streamInitialized, pageUID, startStreaming]);

  return (
    <>
      {isStreaming && progress > 0 && (
        <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {children}
    </>
  );
}
