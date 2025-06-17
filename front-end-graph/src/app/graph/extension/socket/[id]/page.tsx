import React from "react";
import type { Metadata } from "next";
import { NewSocketGraphComponent } from "@/components/socket";

type Props = {
    params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    return {
        title: `Graph View - ${params.id}`,
        description: "View your Notion page as a graph with real-time",
    };
}

export default function SocketGraphPage({ params }: Props) {
    return (
        <div className="overflow-hidden w-full h-screen">
            <NewSocketGraphComponent notionPageId={params.id} />
        </div>
    );
}