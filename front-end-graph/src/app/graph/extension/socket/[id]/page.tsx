import React from "react";
import type { Metadata } from "next";
import { SocketGraphComponent } from "@/components/socket";
import dynamic from "next/dynamic";

type Props = {
    params: { id: string };
};

export const DynamicLazySocketGraphPage = dynamic(() => import("@/components/socket/SocketGraphComponent"), {
    loading: () => <div>Loading...</div>,
    ssr: false,
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    return {
        title: `Graph Mode`,
        description: "View your Notion page as a graph view",
    };
}

export default function SocketGraphPage({ params }: Props) {
    return (
        <div className="overflow-hidden w-full h-screen">
            <DynamicLazySocketGraphPage notionPageId={params.id} />
        </div>
    );
}