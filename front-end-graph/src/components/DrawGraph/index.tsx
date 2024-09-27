"use client";
import React, { useState, useEffect } from "react";
import { convertToExcalidrawElements } from "@excalidraw/excalidraw";

import GraphDraw from "./ExcalidrawDynamic";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { isMock, saveStorage } from "../utils";
import usePageId from "../hooks/usePageId";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { Button } from "../ui/button";
import { GraphData } from "@/types/excalidraw";

export const GraphInExcalidraw: React.FC = () => {
  const pageId = usePageId();
  const data: GraphData | null = saveStorage.get(`coordinates-${pageId}`);
  const [elements, setElements] = useState<ExcalidrawElement[]>([]);
  const [excalidrawAPI, setExcalidrawAPI] = useState<
    ExcalidrawImperativeAPI | undefined
  >(undefined);

  const transformGraphToExcalidraw = ({
    nodes,
    links,
  }: GraphData): ExcalidrawElement[] => {
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
      link: isMock(pageId)
        ? ""
        : `https://notion.so/${node.id.replaceAll("-", "")}`,
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

    // const excalidrawArrows = links
    //   .map((link) => {
    //     const sourceNode = nodes.find((node) => node.id === link.source);
    //     const targetNode = nodes.find((node) => node.id === link.target);

    //     if (sourceNode && targetNode) {
    //       return {
    //         type: "arrow",
    //         id: `arrow-${link.source}-${link.target}`,
    //         x: sourceNode.x + 15,
    //         y: sourceNode.y,
    //         strokeColor: "#000",
    //         startArrowhead: null,
    //         endArrowhead: "arrow",
    //         seed: Math.random(),
    //         start: {
    //           type: "text",
    //           id: sourceNode.id,
    //         },
    //         end: {
    //           type: "text",
    //           id: `label-${targetNode.id}`,
    //         },
    //       };
    //     }
    //     return null;
    //   })
    //   .filter(Boolean);

    // console.log(excalidrawArrows);

    //@ts-ignore
    return convertToExcalidrawElements([
      ...excalidrawNodes,
      ...excalidrawLabels,
      // ...excalidrawArrows,
    ]);
  };

  const updateExcalidraw = (graphData: GraphData) => {
    const elements = transformGraphToExcalidraw(graphData);
    if (elements.length > 0) {
      setElements(elements);
    }
  };

  useEffect(() => {
    if (data) {
      updateExcalidraw(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <GraphDraw
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        initialData={{
          elements,
          scrollToContent: true,
        }}
        renderTopRightUI={() => (
          <a href={`${window.origin}/graph/${pageId}`}>
            <Button>Back to Graph Mode</Button>
          </a>
        )}
      />
    </div>
  );
};
