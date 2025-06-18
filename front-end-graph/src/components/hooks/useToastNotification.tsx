import { useEffect } from "react";
import { useToast } from "./use-toast";
import { useGraphContextData } from "../Context/GraphContext";
import { usePathname } from "next/navigation";
import { ToastAction } from "../ui/toast";
import Link from "next/link";

export default function useToastNotification() {
  const {
    state: { errorFetchGraph, loadingFetchGraph, metadata },
  } = useGraphContextData();

  const pathname = usePathname();
  const isExtension = pathname.includes("extension");

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
    if (!loadingFetchGraph && !errorFetchGraph) {
      toast({
        title: "Graph Loaded!",
        description: `You can synchronize with your Notion again in Menu!`,
      });
    }
  }, [loadingFetchGraph, toast]);

  useEffect(() => {
    if (!metadata?.isVip && !loadingFetchGraph && isExtension) {
      toast({
        title: "Graph Mode",
        description: `You can get full experience with Graph Mode in VIP Tier!`,
        action: (
          <Link href="/pricing" target="_blank" className="flex">
            <ToastAction
              altText="Premium"
              className="hover:opacity-65 hover:bg-primary"
            >
              Get VIP Tier
            </ToastAction>
          </Link>
        ),
        className: "bg-red-800 text-white",
      });
    }
  }, [metadata, toast, loadingFetchGraph]);

  return;
}
