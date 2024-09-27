"use client";
import React, { useState, useEffect } from "react";
import { convertToExcalidrawElements } from "@excalidraw/excalidraw";

import GraphDraw from "./ExcalidrawDynamic";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { saveStorage } from "../utils";
import usePageId from "../hooks/usePageId";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { Button } from "../ui/button";

export const GraphInExcalidraw = () => {
  const pageId = usePageId();
  const data = saveStorage.get(`coordinates-${pageId}`);
  const [elements, setElements] = useState<ExcalidrawElement[]>([]);
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI>();
  const [center, setUpdate] = useState(false);

  const transformGraphToExcalidraw = ({ nodes, links }) => {
    const excalidrawNodes = nodes.map((node) => ({
      type: "ellipse",
      id: node.id,
      groupIds: [`group-${node.id}`],
      x: node.x,
      y: node.y,
      width: 30,
      height: 30,
      strokeColor: "#000",
      backgroundColor: "#000",
      seed: Math.random(),
      isSelected: false,
    }));

    const excalidrawLabels = nodes.map((node) => ({
      type: "text",
      id: `label-${node.id}`,
      groupIds: [`group-${node.id}`],
      x: node.x,
      y: node.y + 40,
      text: node.label,
      fontSize: 16,
      strokeColor: "#000",
      isSelected: false,
    }));

    // const excalidrawArrows = links.map((link) => ({
    //   type: "arrow",
    //   points: [
    //     [link.source.x, link.source.y],
    //     [link.target.x, link.target.y],
    //   ],
    //   strokeColor: "#000",
    //   startArrowhead: null,
    //   endArrowhead: "arrow",
    //   seed: Math.random(),
    // }));

    return convertToExcalidrawElements([
      ...excalidrawNodes,
      ...excalidrawLabels,
      // ...excalidrawArrows,
    ]);
  };

  const updateExcalidraw = (graphData) => {
    const elements = transformGraphToExcalidraw(graphData);
    if (elements.length > 0 && !center) {
      setElements(elements);

      // Calculate the scroll to the center of the first element
      const { x, y } = elements[0]; // For example, scroll to the first element

      excalidrawAPI?.updateScene({
        elements: elements,
        appState: {
          scrollX: x - window.innerWidth / 2, // Center horizontally
          scrollY: y - window.innerHeight / 2, // Center vertically
        },
      });
      setUpdate(true);
    }
  };

  useEffect(() => {
    if (data) {
      updateExcalidraw(data);
    }
  }, []);

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <GraphDraw
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        initialData={{
          elements,
          scrollToContent: true,
        }}
        renderTopRightUI={() => {
          return (
            <a href={`${window.origin}/graph/${pageId}`}>
              <Button>Back to Graph Mode</Button>
            </a>
          );
        }}
      />
    </div>
  );
};
