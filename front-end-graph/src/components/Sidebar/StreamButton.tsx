"use client";

import React from "react";
import { useStreamGraphData } from "../hooks/useStreamGraphData";
import { useGraphContextData } from "../Context/GraphContext";
import { Button } from "@/components/ui/button";
import { RepeatIcon, Loader2Icon } from "lucide-react";

export const StreamButton: React.FC = () => {
    const {
        state: { pageId }
    } = useGraphContextData();
    const { isStreaming, startStreaming, stopStreaming } = useStreamGraphData(pageId);

    const handleToggleStream = () => {
        if (isStreaming) {
            stopStreaming();
        } else {
            startStreaming();
        }
    };

    // Don't show for mock data
    if (pageId === "mock") {
        return null;
    }

    return (
        <Button
            onClick={handleToggleStream}
            variant="outline"
            size="sm"
            className="w-full justify-start"
            disabled={pageId === "mock"}
        >
            {isStreaming ? (
                <>
                    <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                    Stop Streaming
                </>
            ) : (
                <>
                    <RepeatIcon className="h-4 w-4 mr-2" />
                    Stream Updates
                </>
            )}
        </Button>
    );
}; 