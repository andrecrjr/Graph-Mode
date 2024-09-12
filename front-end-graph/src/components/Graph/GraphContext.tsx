"use client";
import React, { createContext, useContext, useState } from "react";

export const GraphContext = createContext<{
  getNodes: { nodes: Node[] };
  setNodes: React.Dispatch<React.SetStateAction<{ nodes: Node[] }>>;
}>({
  getNodes: { nodes: [] },
  setNodes: () => {},
});

export const GraphContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [getNodes, setNodes] = useState<{ nodes: Node[] }>({ nodes: [] });
  return (
    <GraphContext.Provider value={{ getNodes, setNodes }}>
      {children}
    </GraphContext.Provider>
  );
};

export const useGraphContextData = () => {
  const { getNodes, setNodes } = useContext(GraphContext);
  return { getNodes, setNodes };
};
