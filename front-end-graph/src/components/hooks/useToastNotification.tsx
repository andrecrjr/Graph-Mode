import { useEffect } from "react";
import { useToast } from "./use-toast";
import { useGraphContextData } from "../Context/GraphContext";

export default function useToastNotification() {
  const {
    state: { errorFetchGraph },
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

  return;
}
