import React from "react";
import ExtensionGraphComponent from "../GraphComponent";
import type { Metadata } from "next";

type Props = {
    params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    return {
        title: `Graph View - ${params.id}`,
        description: "View your Notion page as a graph",
    };
}

export default function ExtensionGraphPage({ params }: Props) {
    return (
        <div className="overflow-hidden w-full h-screen">
            <ExtensionGraphComponent notionPageId={params.id} />
        </div>
    );
}
