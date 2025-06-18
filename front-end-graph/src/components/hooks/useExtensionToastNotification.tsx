import { useEffect } from "react";
import { useToast } from "./use-toast";
import { useGraphContextData } from "../Context/GraphContext";
import { usePathname } from "next/navigation";
import { ToastAction } from "../ui/toast";
import Link from "next/link";
import useToastNotification from "./useToastNotification";

export function useExtensionToastNotification() {
    const {
        state: { errorFetchGraph, loadingFetchGraph, metadata },
    } = useGraphContextData();
    useToastNotification();

    const pathname = usePathname();
    const isExtension = pathname.includes("extension");

    const { toast } = useToast();

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
