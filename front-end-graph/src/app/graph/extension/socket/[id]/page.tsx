import React from "react";
import type { Metadata } from "next";
import { SocketGraphComponent } from "@/components/socket";

type Props = {
    params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    return {
        title: `Graph Mode`,
        description: "View your Notion page as a graph view",
    };
}

export default function SocketGraphPage({ params }: Props) {
    return (
        <div className="overflow-hidden w-full h-screen">
            <SocketGraphComponent notionPageId={params.id} />
        </div>
    );
}