import { useState, useEffect, useCallback } from "react";
import dataMock from "@/components/mock.json";
import { fetchAndSaveCacheData, processGraphData } from "../utils/graph";
import { useSession } from "next-auth/react";
import { Link, Node } from "../../../types/graph";

export const useFetchGraphData = (pageId: string) => {
  const { data: authData, status } = useSession();

  const [data, setData] = useState<{ nodes: Node[]; links: Link[] } | null>(
    null,
  );
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


        setData(processedGraphData);
      } else {
        setError("No data returned from API.");
      }
    } catch (error) {
      //@ts-expect-error
      setError("Error fetching graph data: " + error.message);
      console.error("Error fetching graph data:", error);
    } finally {
      setLoading(false);
    }
  }, [authData?.user?.tokens.access_token, pageId, processGraphDataMemoized]);

  useEffect(() => {
    if (authData && !data) {
      fetchGraphData();
    }
    if (pageId === "mock" && !data) {
      const data = processGraphData(dataMock, "mock");
      setData(data);
    }
  }, [status, authData, data, pageId, fetchGraphData]);

  return { data, loading, error };
};
