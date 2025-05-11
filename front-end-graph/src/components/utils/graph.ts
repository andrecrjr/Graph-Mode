import { Link, Node } from "../../../types/graph";
import { fetchServer } from "../service/Notion";
import { saveStorage } from "./";

export const loadNodePositions = (blockId: string) => {
  const savedPositionsKey = `nodePositions-${blockId}`;
  return saveStorage.get(savedPositionsKey);
};

interface ApiResponse {
  graph?: any[];
  metadata?: {
    tier?: string;
    isVip?: boolean;
    requestCount?: number;
    requestLimit?: number;
  };
  [key: string]: any;
}

export const fetchAndSaveCacheData = async (
  pageId: string,
  token: string,
  userNotion: string,
): Promise<ApiResponse> => {
  const localStorageKey = `data-block-${pageId}`;
  const tempStorageKey = `temp-data-blocks-${pageId}`;
  const cachedData = saveStorage.get(localStorageKey);
  saveStorage.set("notionKey", token);

  if (cachedData) {
    return cachedData;
  }

  const response = await fetchServer(`/blocks/${pageId}?user=${userNotion}`, token) as ApiResponse;

  // Extract blocks data and metadata from response
  const blocksData = response.blocks || response.graph || response;

  // Create enriched data object that includes metadata
  const enrichedData = Array.isArray(blocksData) ? {
    blocks: blocksData,
    tier: response.metadata?.tier || "free",
    isVip: response.metadata?.isVip || false,
    requestCount: response.metadata?.requestCount || 0,
    requestLimit: response.metadata?.requestLimit || 1000
  } : blocksData;

  saveStorage.set(localStorageKey, enrichedData);
  saveStorage.set(tempStorageKey, enrichedData);
  return enrichedData;
};

export const processGraphData = (data: any, blockId: string) => {
  // Extract blocks array if it exists in the enriched data format
  const blocksData = data.blocks || data;

  const nodes: Node[] = blocksData
    .filter((d: any) => d.type === "page")
    .map((d: any) => ({
      id: d.id,
      label: d.label,
      firstParent: d.firstParent,
    }));
  const links: Link[] = blocksData
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
  saveStorage.delete(`data-block-${pageId}`);
};
