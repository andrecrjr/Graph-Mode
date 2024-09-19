import React, { useEffect } from "react";
import { useFetchGraphData } from "../hooks/useFetchGraphData";
import { useParams, useRouter } from "next/navigation";
import { useEditorContext } from "../Context/EditorContext";

export function LoadPageData({ children }: { children: React.ReactNode }) {
  document.body.style.overflow = "hidden";

  const { id: pageId } = useParams();
  const pageUID = pageId as string;
  const router = useRouter();
  if (!pageId) {
    router.push("/");
  }
  // fetch all data and send by GraphDataContext
  useFetchGraphData(pageUID);
  const { editorDispatch } = useEditorContext();

  useEffect(() => {
    editorDispatch({ payload: { pageId: pageUID }, type: "SET_PAGE_ID" });
  }, []);

  return <>{children}</>;
}
