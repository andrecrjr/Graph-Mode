import { useEffect } from "react";
import { useToast } from "./use-toast";
import { useGraphContextData } from "../Context/GraphContext";
import { Menu } from "lucide-react";

export default function useToastNotification() {
  const {
    state: { errorFetchGraph, loadingFetchGraph },
  } = useGraphContextData();

  const { toast } = useToast();

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

  useEffect(() => {
    if (!loadingFetchGraph) {
      toast({
        title: "Graph Loaded!",
        description: `You can synchronize with your Notion again in Menu!`,
      });
    }
  }, [loadingFetchGraph, toast]);

  return;
}
