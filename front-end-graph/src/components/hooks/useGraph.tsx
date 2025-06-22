/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback } from "react";
import * as d3 from "d3";
import { useGraphContextData } from "../Context/GraphContext";
import { Link, Node } from "../../../types/graph";
import { isNodeOrLink } from "../utils";
import { GraphTheme } from "../Context/ThemeContext";
import { getThemeConfig } from "../utils/theme";
import { usePathname } from "next/navigation";

export const useGraph = () => {
  const {
    dispatch,
    state: { pageId },
  } = useGraphContextData();
  const pathname = usePathname();
  const isExtension = pathname.includes("extension");

  const WINDOW = {
    MAX_GRAPH_WIDTH: 6000,
    MAX_GRAPH_HEIGHT: 6000,
    RESPONSE_BREAKPOINT: 600,
    WINDOW_WIDTH: window.innerWidth,
    WINDOW_HEIGHT: window.innerHeight,
    GRAPH_BALL_SIZE: { sm: 10, lg: 15, master: 20 },
    GRAPH_BALL_LABEL_MARGIN: { sm: -35, lg: -45, master: -50 },
  };

  const mountGraph = useCallback(
    (
      data: { nodes?: Node[]; links?: Link[] },
      svgRef: React.MutableRefObject<SVGSVGElement | null>,
      theme: GraphTheme = "default",
    ) => {
      if (!data.nodes || !data.links) return;
      const themeConfig = getThemeConfig(theme);

      const svg = d3
        .select(svgRef.current!)
        .attr("width", WINDOW.MAX_GRAPH_WIDTH)
        .attr("height", WINDOW.MAX_GRAPH_HEIGHT);

      let container = svg.select(".graph-container");

      if (container.empty()) {
        //@ts-ignore
        container = svg.append("g").attr("class", "graph-container");
      } else {
        container.selectAll("*").remove();
      }

      const simulation = d3
        .forceSimulation<Node>(data.nodes)
        .force(
          "link",
          d3
            .forceLink<Node, Link>(data.links)
            .id((d) => d.id)
            .distance(280)
            .strength(2),
        )
        .force(
          "charge",
          d3
            .forceManyBody()
            .strength(-(data.nodes.length > 0 && data.nodes.length * 4)),
        )
        .force(
          "center",
          d3.forceCenter(
            WINDOW.MAX_GRAPH_WIDTH / 3,
            WINDOW.MAX_GRAPH_HEIGHT / 3,
          ),
        )
        .force("collide", d3.forceCollide().radius(60)); // Ajuste o raio conforme necessário

      const link = container
        .append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(data.links)
        .enter()
        .append("line")
        .attr("class", `link ${themeConfig.linkStroke}`);

      const node = container
        .append("g")
        .selectAll("a")
        .data(data.nodes)
        .enter()
        .append("a")
        .attr("xlink:href", (node) => {
          return isExtension ? "#" : `https://notion.so/${(pageId !== "mock" && node.id?.replaceAll("-", "")) || "#"}`;
        })
        .attr("id", (node) => {
          return node.id;
        })
        .on("click", (e, node) => {
          e.preventDefault();
          const notionUrl = `https://notion.so/${(pageId !== "mock" && node.id?.replaceAll("-", "")) || "#"}`;
          if (isExtension) {
            window.parent.postMessage({ redirectGraphModeUrl: notionUrl }, '*');
          } else {
            window.open(notionUrl, "_blank");
          }
        })
        .attr("target", "_blank")
        .append("circle")
        .attr(
          "class",
          `node hover:fill-blue-700 dark:hover:fill-blue-500 cursor-pointer`,
        )
        .attr("class", (d) =>
          d?.firstParent
            ? themeConfig.nodeFill.primary
            : themeConfig.nodeFill.secondary,
        )
        .attr(
          "r",

          (d: any) => {
            if (d.firstParent) {
              return WINDOW.GRAPH_BALL_SIZE["master"];
            }
            return WINDOW.GRAPH_BALL_SIZE[
              WINDOW.WINDOW_WIDTH > WINDOW.RESPONSE_BREAKPOINT ? "sm" : "lg"
            ];
          },
        )
        .call(
          d3
            .drag<SVGCircleElement, Node>()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended),
        );

      const labels = container
        .append("g")
        .attr("class", "labels")
        .selectAll("text")
        .data(data.nodes)
        .enter()
        .append("text")
        .attr("class", `label ${themeConfig.labelFill}`)
        .attr("text-anchor", "middle")
        .attr(
          "dy",

          WINDOW.GRAPH_BALL_SIZE[
          WINDOW.WINDOW_WIDTH > WINDOW.RESPONSE_BREAKPOINT ? "sm" : "lg"
          ] +
          WINDOW.GRAPH_BALL_LABEL_MARGIN[
          WINDOW.WINDOW_WIDTH > WINDOW.RESPONSE_BREAKPOINT ? "sm" : "lg"
          ],
        )
        .text((d) => d.label);

      const initialX = WINDOW.WINDOW_WIDTH / 2 - WINDOW.MAX_GRAPH_WIDTH / 3;
      const initialY = WINDOW.WINDOW_HEIGHT / 2 - WINDOW.MAX_GRAPH_HEIGHT / 3;

      container.attr("transform", `translate(${initialX},${initialY})`);

      simulation.on("tick", () => {
        link
          .attr("x1", (d) => {
            if (isNodeOrLink(d.source)) {
              return d.source.x!;
            }
            return 0;
          })
          .attr("y1", (d) => {
            if (isNodeOrLink(d.source)) {
              return d.source.y!;
            }
            return 0;
          })
          .attr("x2", (d) => {
            if (isNodeOrLink(d.target)) {
              return d.target.x!;
            }
            return 0;
          })
          .attr("y2", (d) => {
            if (isNodeOrLink(d.target)) {
              return d.target.y!;
            }
            return 0;
          });

        node
          .attr("cx", (d) => {
            if (isNodeOrLink(d)) {
              return (d.x = Math.max(
                10,
                Math.min(WINDOW.MAX_GRAPH_WIDTH - 10, d.x!),
              ));
            }
            return 0;
          })
          .attr("cy", (d) => {
            if (isNodeOrLink(d)) {
              return (d.y = Math.max(
                10,
                Math.min(WINDOW.MAX_GRAPH_HEIGHT - 10, d.y!),
              ));
            }
            return 0;
          });

        labels
          .attr("x", (d) => (isNodeOrLink(d) ? d.x! : 0))
          .attr("y", (d) => (isNodeOrLink(d) ? d.y! : 0));
      });

      simulation.on("end", () => {
        console.log("Simulation ended, saving node positions...");
      });

      const zoomed = (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        const { k, x, y } = event.transform;

        const newWidth = Math.max(WINDOW.MAX_GRAPH_WIDTH, Math.abs(x) * 2);
        const newHeight = Math.max(WINDOW.MAX_GRAPH_HEIGHT, Math.abs(y) * 2);
        svg.attr("width", newWidth).attr("height", newHeight);

        container.attr("transform", `translate(${x},${y}) scale(${k})`);
      };
      const zoom = d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.5, 5])
        .on("zoom", zoomed);

      svg
        .call(zoom)
        .call(zoom.transform, d3.zoomIdentity.translate(initialX, initialY));

      function dragstarted(
        event: d3.D3DragEvent<SVGCircleElement, Node, Node>,
        d: Node,
      ) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(
        event: d3.D3DragEvent<SVGCircleElement, Node, Node>,
        d: Node,
      ) {
        d.fx = event.x;
        d.fy = event.y;
        simulation.alpha(0.4).restart();
      }

      function dragended(
        event: d3.D3DragEvent<SVGCircleElement, Node, Node>,
        d: Node,
      ) {
        if (!event.active) simulation.alphaTarget(0.3);
        d.fx = event.x;
        d.fy = event.y;
        simulation.alpha(0.3).restart(); // Reinicia a simulação para que as forças voltem a agir, como gravidade e colisão
      }

      return () => {
        svg.selectAll("*").remove();
      };
    },
    [pageId],
  );

  return { mountGraph };
};
