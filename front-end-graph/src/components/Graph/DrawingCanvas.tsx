// DrawingCanvas.tsx
"use client";
import React, { useEffect, useRef, useState } from "react";
import { PenIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useGraphContextData } from "./GraphContext";

interface DrawingCanvasProps {
  svgRef: React.RefObject<SVGSVGElement>;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ svgRef }) => {
  // State to manage drawing mode
  const [isDrawing, setIsDrawing] = useState("DRAW");
  const { dispatch, state } = useGraphContextData();

  // Function to toggle drawing mode
  const handlePenClick = () => {
    dispatch({ type: "SET_GRAPH_MODE", payload: isDrawing ? "DRAW" : "WATCH" });
  };

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    let currentPath: SVGPathElement | null = null;
    let isMouseDown = false;
    let pathData = "";

    // Helper function to get mouse position relative to SVG
    const getPoint = (event: MouseEvent | TouchEvent) => {
      const rect = svgElement.getBoundingClientRect();
      let clientX: number, clientY: number;

      if (event instanceof MouseEvent) {
        clientX = event.clientX;
        clientY = event.clientY;
      } else {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      }

      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    };

    // Mouse down event handler
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!isDrawing) return;

      isMouseDown = true;
      const point = getPoint(event);

      // Start a new path
      pathData = `M ${point.x} ${point.y}`;
      currentPath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      currentPath.setAttribute("d", pathData);
      currentPath.setAttribute("stroke", "black");
      currentPath.setAttribute("fill", "none");
      currentPath.setAttribute("stroke-width", "2");

      svgElement.appendChild(currentPath);
      // Prevent default behavior
      event.preventDefault();
    };

    // Mouse move event handler
    const handlePointerMove = (event: MouseEvent | TouchEvent) => {
      if (!isDrawing || !isMouseDown || !currentPath) return;

      const point = getPoint(event);
      pathData += ` L ${point.x} ${point.y}`;
      currentPath.setAttribute("d", pathData);

      // Prevent default behavior
      event.preventDefault();
    };

    // Mouse up event handler
    const handlePointerUp = () => {
      if (!isDrawing) return;

      isMouseDown = false;
      currentPath = null;
      pathData = "";
    };

    // Add event listeners for both mouse and touch events
    svgElement.addEventListener("mousedown", handlePointerDown);
    svgElement.addEventListener("mousemove", handlePointerMove);
    svgElement.addEventListener("mouseup", handlePointerUp);
    svgElement.addEventListener("mouseleave", handlePointerUp);

    svgElement.addEventListener("touchstart", handlePointerDown);
    svgElement.addEventListener("touchmove", handlePointerMove);
    svgElement.addEventListener("touchend", handlePointerUp);
    svgElement.addEventListener("touchcancel", handlePointerUp);

    // Cleanup event listeners on unmount or when isDrawing changes
    return () => {
      svgElement.removeEventListener("mousedown", handlePointerDown);
      svgElement.removeEventListener("mousemove", handlePointerMove);
      svgElement.removeEventListener("mouseup", handlePointerUp);
      svgElement.removeEventListener("mouseleave", handlePointerUp);

      svgElement.removeEventListener("touchstart", handlePointerDown);
      svgElement.removeEventListener("touchmove", handlePointerMove);
      svgElement.removeEventListener("touchend", handlePointerUp);
      svgElement.removeEventListener("touchcancel", handlePointerUp);
    };
  }, [isDrawing, svgRef]);

  // Update cursor style based on drawing mode
  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    svgElement.style.cursor = isDrawing ? "crosshair" : "move";
  }, [isDrawing, svgRef]);

  return (
    <>
      {/* Toggle drawing mode when the button is clicked */}
      <Button className="fixed mx-auto right-8" onClick={handlePenClick}>
        <PenIcon />
      </Button>
    </>
  );
};

export default DrawingCanvas;
