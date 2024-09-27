"use client";
import React, { useState, useEffect, useCallback } from "react";
import { convertToExcalidrawElements } from "@excalidraw/excalidraw";

import GraphDraw from "./ExcalidrawDynamic";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { saveStorage } from "../utils";
import usePageId from "../hooks/usePageId";
import { Node } from "../../../types/graph";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";

export const GraphInExcalidraw = () => {
  const pageId = usePageId();
  const data = saveStorage.get(`coordinates-${pageId}`);
  const [elements, setElements] = useState<ExcalidrawElement[]>([]);
  const [scroll, setScroll] = useState({ scrollX: 0, scrollY: 0 });
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI>();
  const [updateCenter, setUpdateCenter] = useState();

  const [zoom, setZoom] = useState(1);

  const transformGraphToExcalidraw = ({ nodes, links }) => {
    const excalidrawNodes = nodes.map((node) => ({
      type: "ellipse",
      id: node.id,
      groupIds: [`group-${node.id}`], // Assign the same groupId for both node and label
      x: node.x,
      y: node.y,
      width: 30,
      height: 30,
      strokeColor: "#000",
      backgroundColor: "#fff",
      seed: Math.random(),
      isSelected: false, // Ensure not selected initially
    }));

    const excalidrawLabels = nodes.map((node) => ({
      type: "text",
      id: `label-${node.id}`, // Use a unique id for the label
      groupIds: [`group-${node.id}`], // Use the same groupId for the label as the node
      x: node.x,
      y: node.y + 40, // Position the label below the node
      text: node.label,
      fontSize: 16,
      strokeColor: "#000",
      isSelected: false, // Ensure not selected initially
    }));

    // Update the links to use arrows instead of lines
    const excalidrawArrows = links.map((link) => ({
      type: "arrow", // Arrow type instead of line
      points: [
        [link.source.x, link.source.y], // Start point (source)
        [link.target.x, link.target.y], // End point (target)
      ],
      strokeColor: "#000",
      startArrowhead: null, // No arrowhead at the start
      endArrowhead: "arrow", // Arrowhead at the end, pointing to the target
      seed: Math.random(),
    }));

    // Combine nodes, labels, and links into one array of elements
    return convertToExcalidrawElements([
      ...excalidrawNodes,
      ...excalidrawLabels,
      ...excalidrawArrows,
    ]);
  };

  // Updates Excalidraw with the converted graph data
  const updateExcalidraw = (graphData) => {
    const elements = transformGraphToExcalidraw(graphData);
    console.log(elements);
    if (elements.length > 0) {
      setElements(elements);
    }
  };

  // On initial load, update the Excalidraw canvas with the D3 graph data
  useEffect(() => {
    if (data) {
      updateExcalidraw(data);
    }
  }, [excalidrawAPI]);

  const scrollUpdate = useCallback(() => {
    if (excalidrawAPI) {
      if (excalidrawAPI.getSceneElements().length > 0) {
        console.log("scroll there fucker");
        excalidrawAPI.scrollToContent(excalidrawAPI.getSceneElements()[5], {
          fitToViewport: true,
          viewportZoomFactor: 8,
        });
      }
    }
  }, []);

  useEffect(() => {
    scrollUpdate();
  }, [excalidrawAPI]);

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <GraphDraw
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        initialData={{
          elements,
        }}
      />
    </div>
  );
};
