import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Node, Link } from "../../../types/graph";

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

interface SocketConnectionOptions {
    pageId: string;
    token: string;
    email: string;
    onElementsReceived: (elements: BlockElement[]) => void;
    onFetchStart?: () => void;
    onFetchComplete?: (metadata?: any) => void;
}

export const useSocketConnection = ({
    pageId,
    token,
    email,
    onElementsReceived,
    onFetchStart,
    onFetchComplete
}: SocketConnectionOptions) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const socketRef = useRef<Socket | null>(null);

    const connectSocket = useCallback(async () => {
        if (!token || !email || !pageId) {
            setError("Missing required connection parameters");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000", {
                auth: { token },
                query: { email, user: email },
                transports: ["websocket"]
            });

            socketRef.current = socket;

            socket.on("connect", () => {
                console.log("Socket connected:", socket.id);
                setIsConnected(true);
                socket.emit("fetchBlocks", { blockId: pageId });
            });

            socket.on("disconnect", () => {
                console.log("Socket disconnected");
                setIsConnected(false);
            });

            socket.on("fetchStart", (data: { blockId: string }) => {
                console.log("Fetch started for block:", data.blockId);
                onFetchStart?.();
            });

            socket.on("blockData", (data: BlockDataMessage) => {
                console.log("Received block data:", data);
                if (data.elements && Array.isArray(data.elements)) {
                    onElementsReceived(data.elements);
                }
            });

            socket.on("newElement", (data: { element: BlockElement; parentId?: string | null }) => {
                console.log("Received new element:", data);
                if (data.element) {
                    onElementsReceived([data.element]);
                }
            });

            socket.on("fetchComplete", (data: any) => {
                console.log("Fetch completed:", data);
                setIsLoading(false);
                onFetchComplete?.(data.metadata);
            });

            socket.on("limitReached", (data: { message: string }) => {
                console.warn("Request limit reached:", data);
                setError(`Request limit reached: ${data.message}`);
                setIsLoading(false);
            });

            socket.on("error", (data: { message: string }) => {
                console.error("Socket error:", data);
                setError(data.message || "Socket connection error");
                setIsLoading(false);
            });

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
    }, [token, email, pageId, onElementsReceived, onFetchStart, onFetchComplete]);

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
        isConnected,
        isLoading,
        error,
        connectSocket,
        disconnectSocket
    };
}; 