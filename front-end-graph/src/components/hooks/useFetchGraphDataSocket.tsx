import { useEffect, useCallback, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useGraphContextData } from "../Context/GraphContext";
import { Node, Link } from "../../../types/graph";

interface SocketGraphData {
    nodes: Node[];
    links: Link[];
    isVip: boolean;
}

interface BlockElement {
    id: string;
    label?: string;
    type: "page" | "node";
    firstParent?: boolean;
    source?: string;
    target?: string;
}

interface BlockDataMessage {
    elements: BlockElement[];
    parentId: string | null;
    batchId: string;
}

interface FetchCompleteData {
    blockId: string;
    metadata?: {
        isVip?: boolean;
        tier?: string;
        requestCount?: number;
        requestLimit?: number;
    };
}

interface LimitReachedData {
    message: string;
    requestCount?: number;
    requestLimit?: number;
}

interface ErrorData {
    message: string;
}

interface NewElementData {
    element: BlockElement;
    parentId?: string | null;
}

export const useFetchGraphDataSocket = (pageId: string, token: string, email: string) => {
    const { dispatch, state } = useGraphContextData();
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const socketRef = useRef<Socket | null>(null);

    const processSocketElements = useCallback((elements: BlockElement[]) => {
        const newNodes: Node[] = [];
        const newLinks: Link[] = [];

        elements.forEach((element) => {
            if (element.type === "page") {
                // Check if node already exists in current context
                const existingNode = state.nodes.nodes?.find(n => n.id === element.id);
                if (!existingNode) {
                    newNodes.push({
                        id: element.id,
                        label: element.label || "Untitled",
                        firstParent: element.firstParent || false
                    });
                }
            } else if (element.type === "node" && element.source && element.target) {
                // Check if link already exists in current context
                const existingLink = state.nodes.links?.find(
                    l => l.source === element.source && l.target === element.target
                );
                if (!existingLink) {
                    newLinks.push({
                        source: element.source,
                        target: element.target
                    });
                }
            }
        });

        // Only dispatch if we have new data
        if (newNodes.length > 0 || newLinks.length > 0) {
            console.log("Processing new socket elements:", { newNodes, newLinks });
            dispatch({
                type: "UPDATE_NODES",
                payload: {
                    nodes: newNodes,
                    links: newLinks
                }
            });
        }
    }, [state.nodes, dispatch]);

    const connectSocket = useCallback(async () => {
        if (!token || !email || !pageId) return;

        setIsLoading(true);
        setError(null);

        try {
            // Initialize socket connection
            const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000", {
                auth: { token },
                query: {
                    email,
                    user: email
                },
                transports: ["websocket"]
            });

            socketRef.current = socket;

            // Connection events
            socket.on("connect", () => {
                console.log("Socket connected:", socket.id);
                setIsConnected(true);

                // Clear existing data and request new data
                dispatch({ type: "SET_NODES", payload: { nodes: [], links: [] } });

                // Request block data
                socket.emit("fetchBlocks", { blockId: pageId });
            });

            socket.on("disconnect", () => {
                console.log("Socket disconnected");
                setIsConnected(false);
            });

            // Data streaming events
            socket.on("fetchStart", (data: { blockId: string }) => {
                console.log("Fetch started for block:", data.blockId);
                dispatch({ type: "LOADED_GRAPH", payload: false });
            });

            socket.on("blockData", (data: BlockDataMessage) => {
                console.log("Received block data:", data);
                processSocketElements(data.elements);
            });

            socket.on("newElement", (data: NewElementData) => {
                console.log("Received new element:", data);
                if (data.element) {
                    processSocketElements([data.element]);
                }
            });

            socket.on("fetchComplete", (data: FetchCompleteData) => {
                console.log("Fetch completed:", data);
                setIsLoading(false);
                dispatch({ type: "LOADED_GRAPH", payload: true });
                if (data.metadata) {
                    dispatch({ type: "SET_IS_VIP", payload: data.metadata.isVip || false });
                }
            });

            socket.on("limitReached", (data: LimitReachedData) => {
                console.warn("Request limit reached:", data);
                setError(`Request limit reached: ${data.message}`);
                setIsLoading(false);
            });

            socket.on("error", (data: ErrorData) => {
                console.error("Socket error:", data);
                setError(data.message || "Socket connection error");
                setIsLoading(false);
            });

            // Handle connection errors
            socket.on("connect_error", (error: Error) => {
                console.error("Connection error:", error);
                setError("Failed to connect to server");
                setIsLoading(false);
            });

        } catch (error) {
            console.error("Error setting up socket:", error);
            setError("Failed to initialize socket connection");
            setIsLoading(false);
        }
    }, [token, email, pageId, processSocketElements, dispatch]);

    const disconnectSocket = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
            setIsConnected(false);
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            disconnectSocket();
        };
    }, [disconnectSocket]);

    return {
        connectSocket,
        disconnectSocket,
        isConnected,
        isLoading,
        error,
        data: state.nodes
    };
}; 