import { Link, Node } from "../../../types/graph";
import { fetchServer } from "../service/Notion";
import { saveStorage } from "./";

export const loadNodePositions = (blockId: string) => {
  const savedPositionsKey = `nodePositions-${blockId}`;
  return saveStorage.get(savedPositionsKey);
};

export const fetchAndSaveCacheData = async (pageId: string, token: string) => {
  const localStorageKey = `data-block-${pageId}`;
  const tempStorageKey = `temp-data-blocks-${pageId}`;
  const cachedData = saveStorage.get(localStorageKey);
  saveStorage.set("notionKey", token);

  if (cachedData) {
    return cachedData;
  }

  const data = await fetchServer(`/blocks/${pageId}`, token);

  saveStorage.set(localStorageKey, data);
  saveStorage.set(tempStorageKey, data);
  return data;
};

export const processGraphData = (data: any, blockId: string) => {
  const nodes: Node[] = data
    .filter((d: any) => d.type === "page")
    .map((d: any) => ({
      id: d.id,
      label: d.label,
      firstParent: d.firstParent,
    }));
  const links: Link[] = data
    .filter(
      (d: any) =>
        d.type === "node" &&
        nodes.some((node: Node) => node.id === d.source) &&
        nodes.some((node: Node) => node.id === d.target),
    )
    .map((d: any) => ({ source: d.source, target: d.target }));

  const savedPositions = loadNodePositions(blockId);
  savedPositions &&
    nodes.forEach((node) => {
      if (savedPositions[node.id]) {
        node.fx = savedPositions[node.id].x;
        node.fy = savedPositions[node.id].y;
      }
    });

  return { nodes, links };
};

export const saveNodePositions = (
  data: { nodes?: Node[]; links?: Link[] },
  pageId: string,
) => {
  const positions =
    data?.nodes?.reduce(
      (acc, node) => {
        acc[node.id] = { x: node.x || 0, y: node.y || 0 };
        return acc;
      },
      {} as Record<string, { x: number | null; y: number | null }>,
    ) || [];

  saveStorage.set(`nodePositions-${pageId}`, positions);
};

export const clearNodePositions = (pageId: string) => {
  if (localStorage.getItem(`nodePositions-${pageId}`)) {
    localStorage.removeItem(`nodePositions-${pageId}`);
  }
  window.location.reload();
};

export const syncPage = (pageId: string) => {
  saveStorage.delete(`nodePositions-${pageId}`);
  saveStorage.delete(`data-block-${pageId}`);
};
