import { useEffect, useCallback } from "react";
import dataMock from "@/components/mock.json";
import { fetchAndSaveCacheData, processGraphData } from "../utils/graph";
import { useGraphContextData } from "../Context/GraphContext";
import { isMock, saveStorage } from "../utils";
import { useUserSession } from "../Context/UserSessionContext";
import { useToast } from "./use-toast";
import Link from "next/link";

export const useFetchGraphData = (pageId: string) => {
  const { session: authData, status } = useUserSession();
  const { dispatch, state } = useGraphContextData();
  const { toast } = useToast();

  const processGraphDataMemoized = useCallback(
    (data: any) => processGraphData(data, pageId),
    [pageId],
  );

  const fetchGraphData = useCallback(async () => {
    try {
      if (authData?.user?.tokens.access_token) {
        const data = await fetchAndSaveCacheData(
          pageId,
          authData?.user?.tokens?.access_token || "",
          authData?.user[authData?.user?.type as "person"]?.email || "",
        );
        const processedGraphData = processGraphDataMemoized(data);
        dispatch({ type: "SET_NODES", payload: processedGraphData });

        // Check if user is on free plan and approaching request limits
        const { tier } = data;
        const isFreeTier = tier === "free";

        if (isFreeTier &&
          !authData?.user?.subscriptionId &&
          !authData?.user?.lifetimePaymentId) {
          toast({
            title: "You are on free plan",
            description: (
              <>
                Some notion pages not loaded because you have reached your limit of requests.
                <Link href="/pricing" className="ml-1 font-bold underline">
                  Upgrade to Premium
                </Link>
              </>
            ),
            className: "bg-amber-100 border-amber-400 dark:bg-amber-900 dark:border-amber-400",
          });
        }
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
  }, [authData, pageId, processGraphDataMemoized, dispatch, toast]);

  useEffect(() => {
    if (
      authData &&
      state.nodes &&
      state?.nodes?.nodes?.length === 0 &&
      pageId !== "mock"
    ) {
      fetchGraphData();
    }

    if (isMock(pageId) && state.nodes && state?.nodes?.nodes?.length === 0) {
      const data = processGraphDataMemoized(dataMock);
      dispatch({ type: "LOADED_GRAPH", payload: false });
      dispatch({ type: "SET_NODES", payload: data });
      saveStorage.set("data-block-mock", dataMock);
    }
  }, [status, authData, state.nodes, pageId, fetchGraphData, dispatch]);

  return { data: state.nodes };
};
