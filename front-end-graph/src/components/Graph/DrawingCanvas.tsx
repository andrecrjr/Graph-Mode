import React, {
  useEffect,
  useRef,
  useLayoutEffect,
  useState,
  RefObject,
} from "react";
import { select, Selection } from "d3";
import { Eraser, PenIcon, Undo2 } from "lucide-react";
import { Button } from "../ui/button";
import { useGraphContextData } from "./GraphContext";
import { saveStorage } from "../utils";

interface DrawingCanvasProps {
  svgRef: RefObject<SVGSVGElement>;
  pageId: string;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ svgRef, pageId }) => {
  const drawingRef = useRef(false);
  const isMouseDownRef = useRef(false);
  const currentPathRef = useRef<Selection<
    SVGPathElement,
    unknown,
    null,
    undefined
  > | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathsRef = useRef<
    Selection<SVGPathElement, unknown, null, undefined>[]
  >([]);
  const [pathsCount, setPathsCount] = useState(0);
  const { dispatch, state } = useGraphContextData();
  const [pathsData, setPathsData] = useState<string[]>([]);

  const handlePenClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    drawingRef.current = !drawingRef.current;

    dispatch({
      type: "SET_GRAPH_MODE",
      payload: drawingRef.current ? "DRAW" : "WATCH",
    });
  };

  useEffect(() => {
    const savedPaths = saveStorage.get(`drawingPaths-${pageId}`);
    if (savedPaths) {
      const parsedPaths = savedPaths as string[];
      const svgElement = svgRef.current;
      if (!svgElement) return;
      const svg = select(svgElement);

      parsedPaths.forEach((pathD) => {
        const path = svg
          .append("path")
          .attr("d", pathD)
          .attr("stroke", "black")
          .attr("fill", "none")
          .attr("stroke-width", 3);

        pathsRef.current.push(path);
      });

      setPathsData(parsedPaths);
      setPathsCount(parsedPaths.length);
    }
  }, [svgRef, pageId]);

  useEffect(() => {
    saveStorage.set(`drawingPaths-${pageId}`, pathsData);
  }, [pathsData, pageId]);

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    const svg = select(svgElement);
    let pathData: string = "";

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

    const stopDrawingDueToInactivity = () => {
      if (isMouseDownRef.current && currentPathRef.current) {
        isMouseDownRef.current = false;
        const pathD = currentPathRef.current.attr("d");
        setPathsData((prevPathsData) => [...prevPathsData, pathD]);
        pathsRef.current.push(currentPathRef.current);
        setPathsCount(pathsRef.current.length);

        currentPathRef.current = null;
        pathData = "";
      }
    };

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!drawingRef.current) return;

      isMouseDownRef.current = true;
      const point = getPoint(event);

      pathData = `M ${point.x} ${point.y}`;
      currentPathRef.current = svg
        .append("path")
        .attr("d", pathData)
        .attr("stroke", "black")
        .attr("fill", "none")
        .attr("stroke-width", 3);

      event.preventDefault();
    };

    const handlePointerMove = (event: MouseEvent | TouchEvent) => {
      if (
        !drawingRef.current ||
        !isMouseDownRef.current ||
        !currentPathRef.current
      )
        return;

      const point = getPoint(event);
      pathData += ` L ${point.x} ${point.y}`;
      currentPathRef.current.attr("d", pathData);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(stopDrawingDueToInactivity, 65);

      event.preventDefault();
    };

    const handlePointerUp = () => {
      if (currentPathRef.current) {
        const pathD = currentPathRef.current.attr("d");
        setPathsData((prevPathsData) => [...prevPathsData, pathD]);
        pathsRef.current.push(currentPathRef.current);
        setPathsCount(pathsRef.current.length);
      }
      isMouseDownRef.current = false;
      currentPathRef.current = null;
      pathData = "";

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    svg
      .on("mousedown", handlePointerDown)
      .on("mousemove", handlePointerMove)
      .on("mouseup", handlePointerUp)
      .on("mouseleave", handlePointerUp);

    svg
      .on("touchstart", handlePointerDown)
      .on("touchmove", handlePointerMove)
      .on("touchend", handlePointerUp)
      .on("touchcancel", handlePointerUp);

    return () => {
      svg
        .on("mousedown", null)
        .on("mousemove", null)
        .on("mouseup", null)
        .on("mouseleave", null);

      svg
        .on("touchstart", null)
        .on("touchmove", null)
        .on("touchend", null)
        .on("touchcancel", null);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [svgRef]);

  useLayoutEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) return;
    svgElement.style.cursor = drawingRef.current ? "crosshair" : "move";
  }, [svgRef, state.graphMode]);

  const undo = () => {
    if (pathsRef.current.length > 0) {
      const lastPath = pathsRef.current.pop();
      lastPath?.remove();
      setPathsData((prevPathsData) => prevPathsData.slice(0, -1));
      setPathsCount(pathsRef.current.length);
    }
  };

  const removeAll = () => {
    pathsRef.current.forEach((path) => path.remove());
    pathsRef.current = [];
    setPathsData([]);
    setPathsCount(0);
  };

  return (
    <>
      <div className="fixed right-5 top-5 flex flex-row space-y-2">
        <Button onClick={handlePenClick}>
          <PenIcon />
        </Button>
        <Button onClick={undo} disabled={pathsCount === 0}>
          <Undo2 />
        </Button>
        <Button onClick={removeAll} disabled={pathsCount === 0}>
          <Eraser />
        </Button>
      </div>
    </>
  );
};

export default DrawingCanvas;
