"use client";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import * as d3 from "d3";
import { Node, Link } from "../../../types/graph";
import { GraphTheme } from "../Context/ThemeContext";
import { getThemeConfig } from "../utils/theme";
import { isNodeOrLink } from "../utils";
import { usePathname } from "next/navigation";
import { useGraphContextData } from "../Context/GraphContext";

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
    const simulationRef = useRef<d3.Simulation<Node, Link> | null>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);

    // Constants - memoized to prevent unnecessary re-renders
    const WINDOW = useMemo(() => ({
        MAX_GRAPH_WIDTH: 6000,
        MAX_GRAPH_HEIGHT: 6000,
        RESPONSE_BREAKPOINT: 600,
        WINDOW_WIDTH: typeof window !== 'undefined' ? window.innerWidth : 1200,
        WINDOW_HEIGHT: typeof window !== 'undefined' ? window.innerHeight : 800,
        GRAPH_BALL_SIZE: { sm: 10, lg: 15, master: 20 },
        GRAPH_BALL_LABEL_MARGIN: { sm: -35, lg: -45, master: -50 },
    }), []);

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

    // Cleanup function
    const cleanupGraph = useCallback(() => {
        if (simulationRef.current) {
            simulationRef.current.stop();
            simulationRef.current = null;
        }
        if (svgRef.current) {
            const svg = d3.select(svgRef.current);
            svg.selectAll("*").remove();
        }
    }, []);

    // Mount D3 graph
    const mountGraph = useCallback(() => {
        if (!svgRef.current || nodes.length === 0) return;

        // Cleanup previous graph
        cleanupGraph();

        // Filter links to only include those where both source and target nodes exist
        const nodeIds = new Set(nodes.map(n => n.id));
        const validLinks = links.filter(link => {
            const sourceId = typeof link.source === 'string' ? link.source :
                typeof link.source === 'object' && link.source && 'id' in link.source ? link.source.id : '';
            const targetId = typeof link.target === 'string' ? link.target :
                typeof link.target === 'object' && link.target && 'id' in link.target ? link.target.id : '';
            return nodeIds.has(sourceId) && nodeIds.has(targetId);
        });

        console.log('Mounting graph with:', {
            nodeCount: nodes.length,
            totalLinks: links.length,
            validLinks: validLinks.length,
            nodeIds: Array.from(nodeIds),
            invalidLinks: links.filter(link => {
                const sourceId = typeof link.source === 'string' ? link.source :
                    typeof link.source === 'object' && link.source && 'id' in link.source ? link.source.id : '';
                const targetId = typeof link.target === 'string' ? link.target :
                    typeof link.target === 'object' && link.target && 'id' in link.target ? link.target.id : '';
                return !nodeIds.has(sourceId) || !nodeIds.has(targetId);
            })
        });

        const themeConfig = getThemeConfig(theme);
        const svg = d3.select(svgRef.current)
            .attr("width", WINDOW.MAX_GRAPH_WIDTH)
            .attr("height", WINDOW.MAX_GRAPH_HEIGHT);

        // Clear and setup container
        svg.selectAll("*").remove();
        const container = svg.append("g").attr("class", "graph-container");

        // Initial position
        const initialX = WINDOW.WINDOW_WIDTH / 2 - WINDOW.MAX_GRAPH_WIDTH / 3;
        const initialY = WINDOW.WINDOW_HEIGHT / 2 - WINDOW.MAX_GRAPH_HEIGHT / 3;
        container.attr("transform", `translate(${initialX},${initialY})`);

        // Create simulation
        const simulation = d3.forceSimulation<Node>(nodes)
            .force("charge", d3.forceManyBody().strength(-(nodes.length > 0 ? nodes.length * 4 : 100)))
            .force("center", d3.forceCenter(WINDOW.MAX_GRAPH_WIDTH / 3, WINDOW.MAX_GRAPH_HEIGHT / 3))
            .force("collide", d3.forceCollide().radius(60));

        // Only add link force if we have valid links
        if (validLinks.length > 0) {
            simulation.force("link", d3.forceLink<Node, Link>(validLinks)
                .id((d) => d.id)
                .distance(280)
                .strength(2));
        }

        simulationRef.current = simulation;

        // Create links (only valid ones)
        const linkElements = container
            .append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(validLinks)
            .enter()
            .append("line")
            .attr("class", `link ${themeConfig.linkStroke}`);

        // Create nodes
        const nodeElements = container
            .append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(nodes)
            .enter()
            .append("circle")
            .attr("class", (d) =>
                `node hover:fill-blue-700 dark:hover:fill-blue-500 cursor-pointer ${d.firstParent ? themeConfig.nodeFill.primary : themeConfig.nodeFill.secondary
                }`
            )
            .attr("r", (d) =>
                d.firstParent ? WINDOW.GRAPH_BALL_SIZE.master :
                    WINDOW.GRAPH_BALL_SIZE[WINDOW.WINDOW_WIDTH > WINDOW.RESPONSE_BREAKPOINT ? "sm" : "lg"]
            )
            .on("click", (e, node) => {
                e.preventDefault();
                const notionUrl = `https://notion.so/${pageId !== "mock" && node.id ? node.id.replaceAll("-", "") : "#"}`;
                if (isExtension) {
                    window.parent.postMessage({ redirectGraphModeUrl: notionUrl }, '*');
                } else {
                    window.open(notionUrl, "_blank");
                }
            })
            .call(d3.drag<SVGCircleElement, Node>()
                .on("start", (event, d) => {
                    if (!event.active && simulationRef.current) {
                        simulationRef.current.alphaTarget(0.3).restart();
                    }
                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on("drag", (event, d) => {
                    d.fx = event.x;
                    d.fy = event.y;
                    if (simulationRef.current) {
                        simulationRef.current.alpha(0.4).restart();
                    }
                })
                .on("end", (event, d) => {
                    if (!event.active && simulationRef.current) {
                        simulationRef.current.alphaTarget(0.3);
                    }
                    d.fx = event.x;
                    d.fy = event.y;
                    if (simulationRef.current) {
                        simulationRef.current.alpha(0.3).restart();
                    }
                })
            );

        // Create labels
        const labelElements = container
            .append("g")
            .attr("class", "labels")
            .selectAll("text")
            .data(nodes)
            .enter()
            .append("text")
            .attr("class", `label ${themeConfig.labelFill}`)
            .attr("text-anchor", "middle")
            .attr("dy", WINDOW.GRAPH_BALL_SIZE[WINDOW.WINDOW_WIDTH > WINDOW.RESPONSE_BREAKPOINT ? "sm" : "lg"] +
                WINDOW.GRAPH_BALL_LABEL_MARGIN[WINDOW.WINDOW_WIDTH > WINDOW.RESPONSE_BREAKPOINT ? "sm" : "lg"])
            .text((d) => d.label);

        // Simulation tick
        simulation.on("tick", () => {
            linkElements
                .attr("x1", (d: any) => {
                    if (isNodeOrLink(d.source) && typeof d.source.x === 'number') {
                        return d.source.x;
                    }
                    return 0;
                })
                .attr("y1", (d: any) => {
                    if (isNodeOrLink(d.source) && typeof d.source.y === 'number') {
                        return d.source.y;
                    }
                    return 0;
                })
                .attr("x2", (d: any) => {
                    if (isNodeOrLink(d.target) && typeof d.target.x === 'number') {
                        return d.target.x;
                    }
                    return 0;
                })
                .attr("y2", (d: any) => {
                    if (isNodeOrLink(d.target) && typeof d.target.y === 'number') {
                        return d.target.y;
                    }
                    return 0;
                });

            nodeElements
                .attr("cx", (d) => {
                    if (isNodeOrLink(d) && typeof d.x === 'number') {
                        return d.x = Math.max(10, Math.min(WINDOW.MAX_GRAPH_WIDTH - 10, d.x));
                    }
                    return 0;
                })
                .attr("cy", (d) => {
                    if (isNodeOrLink(d) && typeof d.y === 'number') {
                        return d.y = Math.max(10, Math.min(WINDOW.MAX_GRAPH_HEIGHT - 10, d.y));
                    }
                    return 0;
                });

            labelElements
                .attr("x", (d) => {
                    if (isNodeOrLink(d) && typeof d.x === 'number') {
                        return d.x;
                    }
                    return 0;
                })
                .attr("y", (d) => {
                    if (isNodeOrLink(d) && typeof d.y === 'number') {
                        return d.y;
                    }
                    return 0;
                });
        });

        // Zoom behavior
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.5, 5])
            .on("zoom", (event) => {
                const { k, x, y } = event.transform;
                const newWidth = Math.max(WINDOW.MAX_GRAPH_WIDTH, Math.abs(x) * 2);
                const newHeight = Math.max(WINDOW.MAX_GRAPH_HEIGHT, Math.abs(y) * 2);
                svg.attr("width", newWidth).attr("height", newHeight);
                container.attr("transform", `translate(${x},${y}) scale(${k})`);
            });

        svg.call(zoom).call(zoom.transform, d3.zoomIdentity.translate(initialX, initialY));

        return () => {
            cleanupGraph();
        };
    }, [nodes, links, theme, pageId, isExtension, WINDOW, cleanupGraph]);

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
        cleanupGraph();
    }, [cleanupGraph]);

    // Mount graph when data changes
    useEffect(() => {
        if (nodes.length > 0 && svgRef.current) {
            const cleanup = mountGraph();
            return cleanup;
        }
    }, [nodes, mountGraph]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            disconnectSocket();
        };
    }, [disconnectSocket]);

    const setSVGRef = useCallback((ref: SVGSVGElement | null) => {
        svgRef.current = ref;
    }, []);

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