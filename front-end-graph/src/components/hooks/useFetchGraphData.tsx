import { useState, useEffect, useCallback } from "react";
import dataMock from "@/components/mock.json";
import { fetchAndSaveCacheData, processGraphData } from "../utils/graph";
import { useSession } from "next-auth/react";
import { useGraphContextData } from "../Context/GraphContext";

export const useFetchGraphData = (pageId: string) => {
  const { data: authData, status } = useSession();
  const { dispatch, state } = useGraphContextData();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const processGraphDataMemoized = useCallback(
    (data: any) => processGraphData(data, pageId),
    [pageId],
  );

  const fetchGraphData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (authData?.user?.tokens.access_token) {
        const data = await fetchAndSaveCacheData(
          pageId,
          authData?.user?.tokens?.access_token || "",
        );
        const processedGraphData = processGraphDataMemoized(data);
        console.log(processedGraphData);
        dispatch({ type: "SET_NODES", payload: processedGraphData });
      } else {
        setError("No data returned from API.");
        throw new Error("Problem no data returned from API");
      }
    } catch (error) {
      //@ts-expect-error
      setError("Error fetching graph data: " + error.message);
      console.error("Error fetching graph data:", error);
    } finally {
      setLoading(false);
    }
  }, [
    authData?.user?.tokens.access_token,
    pageId,
    processGraphDataMemoized,
    dispatch,
  ]);

  useEffect(() => {
    if (authData && state.nodes && state?.nodes?.nodes?.length === 0) {
      fetchGraphData();
    }
    if (pageId === "mock" && !state.nodes) {
      const data = processGraphData(dataMock, "mock");
      dispatch({ type: "SET_NODES", payload: data });
    }
  }, [status, authData, state.nodes, pageId, fetchGraphData]);

  return { data: state.nodes, loading, error };
};
