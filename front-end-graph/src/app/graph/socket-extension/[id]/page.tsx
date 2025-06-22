import React from "react";
import type { Metadata } from "next";
import { DynamicLazySocketGraphPage } from "@/components/pages/dynamicPages";

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
            <DynamicLazySocketGraphPage notionPageId={params.id} />
        </div>
    );
}