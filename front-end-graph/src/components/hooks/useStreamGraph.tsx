"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Node, Link } from "../../../types/graph";
import { GraphTheme } from "../Context/ThemeContext";
import { usePathname } from "next/navigation";
import { useGraphContextData } from "../Context/GraphContext";
import { useD3Graph } from "./useD3Graph";

interface BlockElement {
    id: string;
    label?: string;
    type: "page" | "node";
    firstParent?: boolean;
    source?: string;
    target?: string;
}

interface StreamGraphOptions {
    pageId: string;
    token: string;
    email: string;
    theme?: GraphTheme;
}

export const useStreamGraph = ({ pageId, token, email, theme = "default" }: StreamGraphOptions) => {
    const pathname = usePathname();
    const isExtension = pathname.includes("extension");
    const { dispatch } = useGraphContextData();

    // State
    const [nodes, setNodes] = useState<Node[]>([]);
    const [links, setLinks] = useState<Link[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Refs
    const socketRef = useRef<Socket | null>(null);

    // Use D3 graph hook for better separation of concerns
    const { renderGraph, cleanup, setSVGRef } = useD3Graph({
        theme,
        pageId,
        isExtension
    });

    // Process socket elements
    const processElements = useCallback((elements: BlockElement[]) => {
        const newNodes: Node[] = [];
        const newLinks: Link[] = [];

        elements.forEach((element) => {
            if (element.type === "page") {
                newNodes.push({
                    id: element.id,
                    label: element.label || "Untitled",
                    firstParent: element.firstParent || false
                });
            } else if (element.type === "node" && element.source && element.target) {
                newLinks.push({
                    source: element.source,
                    target: element.target
                });
            }
        });

        console.log('Processing elements:', {
            totalElements: elements.length,
            newNodes: newNodes.length,
            newLinks: newLinks.length,
            nodeIds: newNodes.map(n => n.id),
            linkPairs: newLinks.map(l => `${l.source}->${l.target}`)
        });

        setNodes(prev => {
            const existingIds = new Set(prev.map(n => n.id));
            const uniqueNewNodes = newNodes.filter(n => !existingIds.has(n.id));
            const result = [...prev, ...uniqueNewNodes];
            console.log('Nodes updated:', {
                previous: prev.length,
                new: uniqueNewNodes.length,
                total: result.length,
                allNodeIds: result.map(n => n.id)
            });
            return result;
        });

        setLinks(prev => {
            const existingLinks = new Set(prev.map(l => {
                const sourceId = typeof l.source === 'string' ? l.source :
                    typeof l.source === 'object' && l.source && 'id' in l.source ? l.source.id : '';
                const targetId = typeof l.target === 'string' ? l.target :
                    typeof l.target === 'object' && l.target && 'id' in l.target ? l.target.id : '';
                return `${sourceId}-${targetId}`;
            }));
            const uniqueNewLinks = newLinks.filter(l => !existingLinks.has(`${l.source}-${l.target}`));
            const result = [...prev, ...uniqueNewLinks];
            console.log('Links updated:', {
                previous: prev.length,
                new: uniqueNewLinks.length,
                total: result.length
            });
            return result;
        });
    }, []);

    // Socket connection
    const connectSocket = useCallback(() => {
        if (!token || !email || !pageId) return;

        setIsLoading(true);
        setError(null);
        setNodes([]);
        setLinks([]);

        const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "ADD_SOCKET_URL", {
            auth: { token },
            query: { email, user: email },
            transports: ["websocket"]
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            setIsConnected(true);
            socket.emit("fetchBlocks", { blockId: pageId });
        });

        socket.on("disconnect", () => {
            setIsConnected(false);
        });

        socket.on("fetchStart", () => {
            setNodes([]);
            setLinks([]);
        });

        socket.on("blockData", (data: { elements: BlockElement[] }) => {
            if (data.elements && Array.isArray(data.elements)) {
                dispatch({ type: "LOADED_GRAPH", payload: true });
                processElements(data.elements);
            }
        });

        socket.on("newElement", (data: { element: BlockElement }) => {
            if (data.element) {
                dispatch({ type: "LOADED_GRAPH", payload: true });
                processElements([data.element]);
            }
        });

        socket.on("fetchComplete", (data: { blockId: string; metadata?: { isVip: boolean; tier: string; requestCount: number; requestLimit: number } }) => {
            setIsLoading(false);
            if (data.metadata) {
                dispatch({ type: "LOADED_GRAPH", payload: false });
                dispatch({
                    type: "SET_METADATA",
                    payload: data.metadata
                });
            }
        });

        socket.on("error", (data: { message: string }) => {
            setError(data.message || "Socket connection error");
            dispatch({ type: "ERROR_GRAPH", payload: true });
            setIsLoading(false);
            dispatch({ type: "LOADED_GRAPH", payload: false });
        });

        socket.on("connect_error", (error: Error) => {
            setError("Failed to connect to server");
            dispatch({ type: "ERROR_GRAPH", payload: true });
            setIsLoading(false);
            dispatch({ type: "LOADED_GRAPH", payload: false });
        });

    }, [token, email, pageId, processElements, dispatch]);

    const disconnectSocket = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
            setIsConnected(false);
        }
        cleanup();
    }, [cleanup]);

    // Render graph when data changes
    useEffect(() => {
        if (nodes.length > 0) {
            renderGraph(nodes, links);
        }
    }, [nodes, links, renderGraph]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            disconnectSocket();
        };
    }, [disconnectSocket]);

    return {
        // State
        isConnected,
        isLoading,
        error,
        nodeCount: nodes.length,
        linkCount: links.length,

        // Actions
        connectSocket,
        disconnectSocket,
        setSVGRef
    };
}; 