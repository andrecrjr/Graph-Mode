import React from "react";
import type { Metadata } from "next";
import { ExtensionGraphComponent } from "@/components/pages/dynamicPages";

type Props = {
    params: { id: string };
};


export async function generateMetadata({ params }: Props): Promise<Metadata> {
    return {
        title: `Graph Mode`,
        description: "View your Notion page as a graph like Obsidian",
    };
}

export default function ExtensionGraphPage({ params }: Props) {
    return (
        <div className="overflow-hidden w-full h-screen">
            <ExtensionGraphComponent notionPageId={params.id} />
        </div>
    );
}
