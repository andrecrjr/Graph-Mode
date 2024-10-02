import { useEffect, useCallback } from "react";
import dataMock from "@/components/mock.json";
import { fetchAndSaveCacheData, processGraphData } from "../utils/graph";
import { useSession } from "next-auth/react";
import { useGraphContextData } from "../Context/GraphContext";
import { saveStorage } from "../utils";

export const useFetchGraphData = (pageId: string) => {
  const { data: authData, status } = useSession();
  const { dispatch, state } = useGraphContextData();

  const processGraphDataMemoized = useCallback(
    (data: any) => processGraphData(data, pageId),
    [pageId],
  );

  const fetchGraphData = useCallback(async () => {
    try {
      console.log(authData);
      if (authData?.user?.tokens.access_token) {
        const data = await fetchAndSaveCacheData(
          pageId,
          authData?.user?.tokens?.access_token || "",
        );
        const processedGraphData = processGraphDataMemoized(data);
        dispatch({ type: "SET_NODES", payload: processedGraphData });
      } else {
        dispatch({ type: "ERROR_GRAPH", payload: true });
        throw new Error("Problem no data returned from API");
      }
    } catch (error) {
      const tempData = saveStorage.get(`temp-data-blocks-${pageId}`);
      const processedGraphData = processGraphDataMemoized(tempData);
      dispatch({ type: "SET_NODES", payload: processedGraphData });
      dispatch({ type: "ERROR_GRAPH", payload: true });
      console.error("Error fetching graph data:", error);
    } finally {
      dispatch({ type: "LOADED_GRAPH", payload: false });
    }
  }, [authData, pageId, processGraphDataMemoized, dispatch]);

  useEffect(() => {
    if (
      authData &&
      state.nodes &&
      state?.nodes?.nodes?.length === 0 &&
      pageId !== "mock"
    ) {
      fetchGraphData();
    }

    if (pageId === "mock" && state.nodes && state?.nodes?.nodes?.length === 0) {
      const data = processGraphData(dataMock, "mock");
      dispatch({ type: "LOADED_GRAPH", payload: false });
      dispatch({ type: "SET_NODES", payload: data });
    }
  }, [status, authData, state.nodes, pageId, fetchGraphData, dispatch]);

  return { data: state.nodes };
};
