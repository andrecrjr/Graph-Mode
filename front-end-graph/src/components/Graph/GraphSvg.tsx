"use client";
import React, { useEffect, useRef } from "react";
import { useGraphContextData } from "../Context/GraphContext";
import { useGraph } from "../hooks/useGraph";
import { useTheme } from "../Context/ThemeContext";
import { getThemeConfig } from "../utils/theme";

export default function GraphSvg() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const {
    state: { nodes },
  } = useGraphContextData();
  const { mountGraph } = useGraph();
  const { theme } = useTheme();

  // Get theme config safely
  const themeConfig = React.useMemo(() => {
    try {
      return getThemeConfig(theme);
    } catch (error) {
      console.error("Error getting theme config:", error);
      return getThemeConfig("default");
    }
  }, [theme]);

  useEffect(() => {
    try {
      if (nodes && nodes.links && svgRef.current) {
        mountGraph(nodes, svgRef, theme);
      }
    } catch (error) {
      console.error("Error mounting graph with theme:", error);
      // Try with default theme as fallback
      if (nodes && nodes.links && svgRef.current && theme !== "default") {
        mountGraph(nodes, svgRef, "default");
      }
    }
  }, [nodes, mountGraph, theme]);

  return (
    <svg
      ref={svgRef}
      className={`cursor-move ${themeConfig.backgroundClass || "dark:bg-black bg-white"}`}
    ></svg>
  );
}
