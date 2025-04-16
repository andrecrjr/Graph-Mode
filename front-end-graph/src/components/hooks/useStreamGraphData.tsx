"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGraphContextData } from "../Context/GraphContext";
import { processGraphData, processStreamedElements } from "../utils/graph";
import { saveStorage } from "../utils";
import { useToast } from "./use-toast";
import { useUserSession } from "../Context/UserSessionContext";
import { Link, Node } from "../../../types/graph";

interface StreamClient {
    connect: (blockId: string) => Promise<void>;
    disconnect: () => void;
    on: (eventType: string, handler: (data: any) => void) => StreamClient;
}

class NotionStreamClient {
    private baseUrl: string;
    private token: string;
    private user: string;
    private eventSource: EventSource | null = null;
    private handlers: Record<string, (data: any) => void> = {
        status: () => { },
        parent: () => { },
        element: () => { },
        progress: () => { },
        completeState: () => { },
        complete: () => { },
        close: () => { },
        error: () => { }
    };

    constructor(baseUrl: string, token: string, user: string) {
        this.baseUrl = baseUrl || "";
        this.token = token;
        this.user = user;
    }

    connect(blockId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            // EventSource doesn't support headers, so append token to URL
            const url = `${this.baseUrl}/stream/blocks/${blockId}`;
            const fullUrl = new URL(url, window.location.origin);

            // Add token to URL if provided
            if (this.token) {
                console.log("user", this.user);
                fullUrl.searchParams.append("token", this.token);
                if (this.user) fullUrl.searchParams.append("user", this.user);
            }

            this.eventSource = new EventSource(fullUrl.toString());

            // Listen for the SSE connection open
            this.eventSource.onopen = () => {
                console.log("Graph stream connection established");
                resolve();
            };

            // Set up event listeners for each event type
            this.eventSource.addEventListener("status", this.createEventHandler("status"));
            this.eventSource.addEventListener("parent", this.createEventHandler("parent"));
            this.eventSource.addEventListener("element", this.createEventHandler("element"));
            this.eventSource.addEventListener("progress", this.createEventHandler("progress"));
            this.eventSource.addEventListener("completeState", this.createEventHandler("completeState"));
            this.eventSource.addEventListener("complete", this.createEventHandler("complete"));
            this.eventSource.addEventListener("close", this.createEventHandler("close"));

            // Handle error events from EventSource
            this.eventSource.addEventListener("error", (event) => {
                try {
                    // First try to parse as JSON data if it's an error message from the server
                    if ((event as any).data) {
                        const data = JSON.parse((event as any).data);
                        console.error("Stream error:", data);
                        this.handlers.error(data);
                        this.disconnect();
                        reject(data);
                    } else {
                        // If there's no data, it's likely a connection error
                        // This is normal when the stream completes or disconnects
                        console.log("EventSource connection closed or ended");
                        this.handlers.error({ message: "Connection ended", isConnectionEnd: true });
                        reject(new Error("Connection ended"));
                        return;
                    }
                } catch (e) {
                    // If not a JSON error, it's likely a connection error
                    console.log("EventSource connection closed or error");
                    this.handlers.error({ message: "Connection ended", isConnectionEnd: true });
                    // Don't reject here as this could be a normal connection close
                }
                this.disconnect();
            });

            // Add a normal error handler for EventSource
            this.eventSource.onerror = (error: Event) => {
                console.log("EventSource general error - this may be normal on completion");
                // Don't always treat this as fatal - could be normal connection close
                if (this.eventSource?.readyState === EventSource.CLOSED) {
                    console.log("Connection was closed");
                    this.handlers.error({ message: "Connection closed", isConnectionEnd: true });
                }
                this.disconnect();
            };
        });
    }

    createEventHandler(eventType: string) {
        return (event: Event) => {
            try {
                const messageEvent = event as MessageEvent;
                const data = JSON.parse(messageEvent.data);
                this.handlers[eventType](data);

                // If we get a 'complete' event, close the connection cleanly
                if (eventType === "complete" || eventType === "close") {
                    console.log(`Received ${eventType} event, closing connection`);
                    this.disconnect();
                }
            } catch (error) {
                console.error(`Error handling ${eventType} event:`, error);
            }
        };
    }

    on(eventType: string, handler: (data: any) => void): StreamClient {
        if (Object.prototype.hasOwnProperty.call(this.handlers, eventType) && typeof handler === "function") {
            this.handlers[eventType] = handler;
        } else {
            console.error(`Invalid event type: ${eventType}`);
        }
        return this;
    }

    disconnect() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
    }
}

export const useStreamGraphData = (pageId: string) => {
    const { state, dispatch } = useGraphContextData();
    const [isStreaming, setIsStreaming] = useState(false);
    const [progress, setProgress] = useState(0);
    const [client, setClient] = useState<StreamClient | null>(null);
    const { toast } = useToast();
    const { session } = useUserSession();

    // Use a ref to keep track of current nodes/links without triggering effect reruns
    const currentNodesRef = useRef<{ nodes?: Node[], links?: Link[] }>({
        nodes: [],
        links: []
    });

    // Update the ref whenever state.nodes changes
    useEffect(() => {
        currentNodesRef.current = state.nodes;
    }, [state.nodes]);

    // Process incoming stream data
    const handleStreamEvents = useCallback(
        (client: StreamClient) => {
            client
                .on("status", (data) => {
                    console.log("Status:", data.message);
                })
                .on("parent", (data) => {
                    // Parent data usually initializes the graph
                    console.log("Parent received:", data);
                })
                .on("element", (data) => {
                    // Get new elements as they arrive
                    console.log("Element received:", data);
                    const { newElements } = data;
                    if (newElements && newElements.length > 0) {
                        // Get current nodes and links from ref (not from state directly)
                        const existingNodes = currentNodesRef.current?.nodes || [];
                        const existingLinks = currentNodesRef.current?.links || [];

                        // Process streamed elements using the specialized function 
                        // that prevents duplicates
                        const processedData = processStreamedElements(
                            newElements,
                            existingNodes,
                            existingLinks,
                            pageId
                        );

                        // Only update if there are actual changes
                        if (processedData.hasChanges) {
                            dispatch({
                                type: "MERGE_STREAMED_NODES",
                                payload: {
                                    nodes: processedData.nodes,
                                    links: processedData.links
                                }
                            });
                        }
                    }
                })
                .on("progress", (data) => {
                    setProgress(data.progress);
                })
                .on("complete", () => {
                    setIsStreaming(false);
                    dispatch({ type: "LOADED_GRAPH", payload: false });
                    toast({
                        title: "Graph data loaded",
                        description: "The graph data has been fully loaded.",
                    });
                    return;
                })
                .on("error", (error) => {
                    // If this is a normal connection end, don't show an error
                    if (error.isConnectionEnd) {
                        console.log("Stream connection ended normally");
                        setIsStreaming(false);
                        dispatch({ type: "LOADED_GRAPH", payload: false });
                        return;
                    }

                    // Otherwise handle as a real error
                    console.error("Stream error:", error);
                    setIsStreaming(false);
                    dispatch({ type: "ERROR_GRAPH", payload: true });
                    dispatch({ type: "LOADED_GRAPH", payload: false });
                    toast({
                        variant: "destructive",
                        title: "Error loading graph data",
                        description: error.message || "Unknown error",
                    });
                    return;
                })
                .on("complete", () => {
                    setIsStreaming(false);
                    dispatch({ type: "LOADED_GRAPH", payload: false });

                    // Save the current nodes and links to local storage
                    const nodesToSave = currentNodesRef.current.nodes;
                    const linksToSave = currentNodesRef.current.links;
                    saveStorage.set(`data-block-${pageId}`, { nodes: nodesToSave, links: linksToSave });

                    toast({
                        title: "Graph data loaded",
                        description: "The graph data has been fully loaded.",
                    });
                    return;
                })

            return client;
        },
        [dispatch, pageId, toast], // Removed state.nodes from dependencies
    );

    // Connect to the stream
    const startStreaming = useCallback(() => {
        // Prevent multiple stream connections
        if (isStreaming || client) {
            console.log("Stream already active, not starting a new one");
            return;
        }

        // Only start streaming for real pages, not mock data
        if (pageId === "mock") return;

        const token = localStorage.getItem("notionKey");
        if (!token) {
            toast({
                variant: "destructive",
                title: "Authentication error",
                description: "No authentication token found",
            });
            return;
        }

        dispatch({ type: "LOADED_GRAPH", payload: true });
        setIsStreaming(true);

        // Create a new client
        const streamClient = new NotionStreamClient(process.env.NEXT_PUBLIC_SERVER_API || "", token, session?.user.person?.email || "");
        const configuredClient = handleStreamEvents(streamClient);
        setClient(configuredClient);

        // Connect to the stream with rate limiting
        let connectAttempted = false;
        configuredClient
            .connect(pageId)
            .catch((error) => {
                if (connectAttempted) return; // Prevent multiple error handlers
                connectAttempted = true;

                // Don't treat connection end as an error
                if (error?.message === "Connection ended" || error?.message === "Connection closed") {
                    console.log("Stream completed normally");
                    setIsStreaming(false);
                    dispatch({ type: "LOADED_GRAPH", payload: false });
                    return;
                }

                console.error("Stream connection error:", error);
                setIsStreaming(false);
                dispatch({ type: "ERROR_GRAPH", payload: true });
                dispatch({ type: "LOADED_GRAPH", payload: false });
                toast({
                    variant: "destructive",
                    title: "Connection error",
                    description: error.message || "Failed to connect to the graph stream",
                });
            });
    }, [pageId, dispatch, toast, handleStreamEvents, session, isStreaming, client]);

    // Cleanup function
    const stopStreaming = useCallback(() => {
        if (client) {
            client.disconnect();
            setClient(null);
            setIsStreaming(false);
        }
    }, [client]);

    useEffect(() => {
        // Clean up on unmount
        return () => {
            stopStreaming();
        };
    }, [stopStreaming]);

    return {
        isStreaming,
        progress,
        startStreaming,
        stopStreaming
    };
}; 