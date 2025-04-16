import { Link, Node } from "../../../types/graph";
import { fetchServer } from "../service/Notion";
import { saveStorage } from "./";

export const loadNodePositions = (blockId: string) => {
  const savedPositionsKey = `nodePositions-${blockId}`;
  return saveStorage.get(savedPositionsKey);
};

interface ApiResponse {
  blocks?: any[];
  tier?: string;
  isVip?: boolean;
  requestCount?: number;
  requestLimit?: number;
  [key: string]: any;
}

export const fetchAndSaveCacheData = async (
  pageId: string,
  token: string,
  userNotion: string,
) => {
  const localStorageKey = `data-block-${pageId}`;
  const tempStorageKey = `temp-data-blocks-${pageId}`;
  const cachedData = saveStorage.get(localStorageKey);
  saveStorage.set("notionKey", token);

  if (cachedData) {
    return cachedData;
  }

  const response = await fetchServer(`/blocks/${pageId}?user=${userNotion}`, token) as ApiResponse;

  // Extract blocks data and metadata from response
  const blocksData = response.blocks || response;

  // Create enriched data object that includes metadata
  const enrichedData = Array.isArray(blocksData) ? {
    blocks: blocksData,
    tier: response.tier || "free",
    isVip: response.isVip || false,
    requestCount: response.requestCount || 0,
    requestLimit: response.requestLimit || 1000
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

/**
 * Process streaming elements specifically for real-time graph updates
 * This function creates incremental updates that avoid duplicate nodes and links
 */
export const processStreamedElements = (
  newElements: any[],
  existingNodes: Node[] = [],
  existingLinks: Link[] = [],
  blockId: string
) => {
  // Track existing node IDs to avoid duplicates
  const existingNodeIds = new Set(existingNodes.map(node => node.id));

  // Track existing links to avoid duplicates (using composite keys)
  const existingLinkKeys = new Set(
    existingLinks.map(link => `${link.source}:${link.target}`)
  );

  // Filter and create new nodes
  const newNodes: Node[] = newElements
    .filter(el => el.type === "page" && !existingNodeIds.has(el.id))
    .map(el => ({
      id: el.id,
      label: el.label,
      firstParent: el.firstParent,
    }));

  // Apply saved positions if available
  const savedPositions = loadNodePositions(blockId);
  if (savedPositions) {
    newNodes.forEach(node => {
      if (savedPositions[node.id]) {
        node.fx = savedPositions[node.id].x;
        node.fy = savedPositions[node.id].y;
      }
    });
  }

  // Combine existing and new nodes to validate links against the complete node set
  const allNodeIds = new Set([...existingNodeIds, ...newNodes.map(node => node.id)]);

  // Filter and create new links
  const newLinks: Link[] = newElements
    .filter(el => {
      if (el.type !== "node") return false;

      // Check if both source and target nodes exist
      const hasSourceTarget = allNodeIds.has(el.source) && allNodeIds.has(el.target);

      // Check if this link is not already in the graph
      const linkKey = `${el.source}:${el.target}`;
      const isNewLink = !existingLinkKeys.has(linkKey);

      return hasSourceTarget && isNewLink;
    })
    .map(el => ({
      source: el.source,
      target: el.target
    }));

  return {
    nodes: newNodes,
    links: newLinks,
    hasChanges: newNodes.length > 0 || newLinks.length > 0
  };
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
