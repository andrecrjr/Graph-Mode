import { Link, Node } from "../../../types/graph";
import { INotionPage } from "../../../types/notionPage";

export const localStorageKey = (pageId: string) => `data-block-${pageId}`;

export const saveStorage = {
  set: (key: string, data: any) => {
    localStorage.setItem(
      key,
      typeof data == "object" ? JSON.stringify(data) : data,
    );
    return true;
  },
  get: (key: string, raw = false) => {
    const data = localStorage.getItem(key) as string;
    return !raw ? JSON.parse(data) : data;
  },
  delete: (key: string) => {
    localStorage.removeItem(key);
    return true;
  },
};

export const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

export const uuidFormatted = (originalString: string) =>
  `${originalString.slice(0, 8)}-${originalString.slice(8, 12)}-${originalString.slice(12, 16)}-${originalString.slice(16, 20)}-${originalString.slice(20)}`;

export const isMock = (pageId: string) => pageId === "mock";

export const createOrUpdateNode = (
  id: string,
  pageItem: INotionPage,
): { nodes: Node[]; links: Link[] } => {
  const existingData = saveStorage.get(localStorageKey(id)) || [];

  const nodes = {
    nodes: [
      {
        id: pageItem.id,
        label: pageItem.properties?.title.title[0].plain_text,
        type: "page",
      },
    ],
    links: [
      {
        source: pageItem.id,
        target: uuidFormatted(id),
        type: "node",
      },
    ],
  };
  const updatedNodes = [...existingData, ...nodes.nodes, ...nodes.links];
  saveStorage.set(localStorageKey(id), updatedNodes);

  return nodes;
};
