import { useCallback, useRef, useMemo } from "react";
import * as d3 from "d3";
import { Node, Link } from "../../../types/graph";
import { GraphTheme } from "../Context/ThemeContext";
import { getThemeConfig } from "../utils/theme";
import { isNodeOrLink } from "../utils";

interface UseD3GraphOptions {
    theme: GraphTheme;
    pageId: string;
    isExtension: boolean;
    onNodeClick?: (node: Node) => void;
}

export const useD3Graph = ({ theme, pageId, isExtension, onNodeClick }: UseD3GraphOptions) => {
    // Refs
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

    // Create simulation configuration
    const createSimulation = useCallback((nodes: Node[]) => {
        return d3.forceSimulation<Node>(nodes)
            .force("charge", d3.forceManyBody().strength(-300).distanceMax(400))
            .force("center", d3.forceCenter(WINDOW.MAX_GRAPH_WIDTH / 3, WINDOW.MAX_GRAPH_HEIGHT / 3).strength(0.1))
            .force("collide", d3.forceCollide().radius(80).strength(0.8))
            .force("x", d3.forceX(WINDOW.MAX_GRAPH_WIDTH / 3).strength(0.05))
            .force("y", d3.forceY(WINDOW.MAX_GRAPH_HEIGHT / 3).strength(0.05))
            .alphaDecay(0.02)
            .velocityDecay(0.3);
    }, [WINDOW]);

    // Configure link force
    const configureLinkForce = useCallback((validLinks: Link[]) => {
        if (!simulationRef.current) return;

        if (validLinks.length > 0) {
            simulationRef.current.force("link", d3.forceLink<Node, Link>(validLinks)
                .id((d) => d.id)
                .distance(200)
                .strength(0.5)
                .iterations(1));
        } else {
            simulationRef.current.force("link", null);
        }
    }, []);

    // Handle node click
    const handleNodeClick = useCallback((event: any, node: Node) => {
        event.preventDefault();

        if (onNodeClick) {
            onNodeClick(node);
        } else {
            const notionUrl = `https://notion.so/${pageId !== "mock" && node.id ? node.id.replaceAll("-", "") : "#"}`;
            if (isExtension) {
                window.parent.postMessage({ redirectGraphModeUrl: notionUrl }, '*');
            } else {
                window.open(notionUrl, "_blank");
            }
        }
    }, [pageId, isExtension, onNodeClick]);

    // Create drag behavior
    const createDragBehavior = useCallback(() => {
        return d3.drag<SVGCircleElement, Node>()
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
                    simulationRef.current.alphaTarget(0.0);
                }
                // Release the fixed position so node can move freely
                d.fx = null;
                d.fy = null;
            });
    }, []);

    // Setup zoom behavior
    const setupZoomBehavior = useCallback((svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, container: any) => {
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.5, 5])
            .on("zoom", (event) => {
                const { k, x, y } = event.transform;
                const newWidth = Math.max(WINDOW.MAX_GRAPH_WIDTH, Math.abs(x) * 2);
                const newHeight = Math.max(WINDOW.MAX_GRAPH_HEIGHT, Math.abs(y) * 2);
                svg.attr("width", newWidth).attr("height", newHeight);
                (container as any).attr("transform", `translate(${x},${y}) scale(${k})`);
            });

        // Apply zoom behavior and initial transform only if not already set
        if (!svg.property('__zoom_initialized__')) {
            const initialX = WINDOW.WINDOW_WIDTH / 2 - WINDOW.MAX_GRAPH_WIDTH / 3;
            const initialY = WINDOW.WINDOW_HEIGHT / 2 - WINDOW.MAX_GRAPH_HEIGHT / 3;
            svg.call(zoom).call(zoom.transform, d3.zoomIdentity.translate(initialX, initialY));
            svg.property('__zoom_initialized__', true);
        } else {
            // Re-apply zoom behavior for updates (this ensures camera movement still works)
            svg.call(zoom);
        }
    }, [WINDOW]);

    // Render graph
    const renderGraph = useCallback((nodes: Node[], links: Link[]) => {
        if (!svgRef.current || nodes.length === 0) return;

        // Check if this is the first mount or an update
        const isUpdate = simulationRef.current !== null;

        // Filter links to only include those where both source and target nodes exist
        const nodeIds = new Set(nodes.map(n => n.id));
        const validLinks = links.filter(link => {
            const sourceId = typeof link.source === 'string' ? link.source :
                typeof link.source === 'object' && link.source && 'id' in link.source ? link.source.id : '';
            const targetId = typeof link.target === 'string' ? link.target :
                typeof link.target === 'object' && link.target && 'id' in link.target ? link.target.id : '';
            return nodeIds.has(sourceId) && nodeIds.has(targetId);
        });

        console.log('Rendering graph with:', {
            nodeCount: nodes.length,
            totalLinks: links.length,
            validLinks: validLinks.length,
            isUpdate
        });

        const themeConfig = getThemeConfig(theme);
        const svg = d3.select(svgRef.current)
            .attr("width", WINDOW.MAX_GRAPH_WIDTH)
            .attr("height", WINDOW.MAX_GRAPH_HEIGHT);

        // For updates, don't clear the entire SVG
        if (!isUpdate) {
            svg.selectAll("*").remove();
        }

        // Setup container
        let container = svg.select(".graph-container");
        if (container.empty()) {
            container = svg.append("g").attr("class", "graph-container") as any;
            const initialX = WINDOW.WINDOW_WIDTH / 2 - WINDOW.MAX_GRAPH_WIDTH / 3;
            const initialY = WINDOW.WINDOW_HEIGHT / 2 - WINDOW.MAX_GRAPH_HEIGHT / 3;
            container.attr("transform", `translate(${initialX},${initialY})`);
        }

        // Create or update simulation
        if (!simulationRef.current) {
            simulationRef.current = createSimulation(nodes);
        } else {
            // Update existing simulation with new nodes
            simulationRef.current.nodes(nodes);
            simulationRef.current.force("charge", d3.forceManyBody().strength(-300).distanceMax(400));
            simulationRef.current.force("collide", d3.forceCollide().radius(80).strength(0.8));
        }

        // Configure link force
        configureLinkForce(validLinks);

        // Animation settings
        const transitionDuration = 800;
        const centerX = WINDOW.MAX_GRAPH_WIDTH / 3;
        const centerY = WINDOW.MAX_GRAPH_HEIGHT / 3;

        // Create links with smooth entry animations
        const linkElements = container
            .selectAll(".links")
            .data([null])
            .join("g")
            .attr("class", "links")
            .selectAll("line")
            .data(validLinks, (d: any) => `${d.source.id || d.source}-${d.target.id || d.target}`);

        linkElements.exit()
            .transition()
            .duration(transitionDuration)
            .style("opacity", 0)
            .remove();

        const newLinks = linkElements.enter()
            .append("line")
            .attr("class", `link ${themeConfig.linkStroke}`)
            .attr("x1", centerX)
            .attr("y1", centerY)
            .attr("x2", centerX)
            .attr("y2", centerY)
            .style("opacity", 0);

        newLinks.transition()
            .duration(transitionDuration)
            .style("opacity", 1);

        const allLinks = newLinks.merge(linkElements as any);

        // Create nodes with smooth entry animations
        const nodeElements = container
            .selectAll(".nodes")
            .data([null])
            .join("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(nodes, (d: any) => d.id);

        nodeElements.exit()
            .transition()
            .duration(transitionDuration)
            .attr("r", 0)
            .style("opacity", 0)
            .remove();

        const newNodes = nodeElements.enter()
            .append("circle")
            .attr("class", (d) =>
                `node hover:fill-blue-700 dark:hover:fill-blue-500 cursor-pointer ${d.firstParent ? themeConfig.nodeFill.primary : themeConfig.nodeFill.secondary}`
            )
            .attr("cx", () => {
                // Add some randomness to initial position to prevent stacking
                const randomOffset = (Math.random() - 0.5) * 200;
                return centerX + randomOffset;
            })
            .attr("cy", () => {
                const randomOffset = (Math.random() - 0.5) * 200;
                return centerY + randomOffset;
            })
            .attr("r", 0)
            .style("opacity", 0)
            .on("click", handleNodeClick)
            .call(createDragBehavior());

        newNodes.transition()
            .duration(transitionDuration)
            .attr("r", (d) =>
                d.firstParent ? WINDOW.GRAPH_BALL_SIZE.master :
                    WINDOW.GRAPH_BALL_SIZE[WINDOW.WINDOW_WIDTH > WINDOW.RESPONSE_BREAKPOINT ? "sm" : "lg"]
            )
            .style("opacity", 1);

        const allNodes = newNodes.merge(nodeElements as any);

        // Create labels with smooth entry animations
        const labelElements = container
            .selectAll(".labels")
            .data([null])
            .join("g")
            .attr("class", "labels")
            .selectAll("text")
            .data(nodes, (d: any) => d.id);

        labelElements.exit()
            .transition()
            .duration(transitionDuration)
            .style("opacity", 0)
            .remove();

        const newLabels = labelElements.enter()
            .append("text")
            .attr("class", `label ${themeConfig.labelFill}`)
            .attr("text-anchor", "middle")
            .attr("dy", WINDOW.GRAPH_BALL_SIZE[WINDOW.WINDOW_WIDTH > WINDOW.RESPONSE_BREAKPOINT ? "sm" : "lg"] +
                WINDOW.GRAPH_BALL_LABEL_MARGIN[WINDOW.WINDOW_WIDTH > WINDOW.RESPONSE_BREAKPOINT ? "sm" : "lg"])
            .attr("x", centerX)
            .attr("y", centerY)
            .style("opacity", 0)
            .text((d) => d.label);

        newLabels.transition()
            .duration(transitionDuration)
            .style("opacity", 1);

        const allLabels = newLabels.merge(labelElements as any);

        // Simulation tick
        simulationRef.current.on("tick", () => {
            allLinks
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

            allNodes
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

            allLabels
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

        // Setup zoom behavior
        setupZoomBehavior(svg, container);

        // Start simulation with gentle alpha for smooth animation
        simulationRef.current.alpha(0.3).restart();

        return () => {
            cleanup();
        };
    }, [theme, WINDOW, createSimulation, configureLinkForce, handleNodeClick, createDragBehavior, setupZoomBehavior]);

    // Cleanup function
    const cleanup = useCallback(() => {
        if (simulationRef.current) {
            simulationRef.current.stop();
            simulationRef.current = null;
        }
        if (svgRef.current) {
            const svg = d3.select(svgRef.current);
            svg.selectAll("*").remove();
        }
    }, []);

    const setSVGRef = useCallback((ref: SVGSVGElement | null) => {
        svgRef.current = ref;
    }, []);

    return {
        renderGraph,
        cleanup,
        setSVGRef
    };
}; 