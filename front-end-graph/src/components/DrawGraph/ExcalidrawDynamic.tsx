import { ExcalidrawProps } from "@excalidraw/excalidraw/types/types";
import dynamic from "next/dynamic";
import { ComponentType } from "react";
const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  {
    ssr: false,
  },
);
export default function GraphDraw(props: ExcalidrawProps) {
  return <Excalidraw {...props} />;
}
