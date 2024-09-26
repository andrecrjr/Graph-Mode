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

export const uuidFormatted = (originalString: string) => {
  if (!originalString.includes("-")) {
    return `${originalString.slice(0, 8)}-${originalString.slice(8, 12)}-${originalString.slice(12, 16)}-${originalString.slice(16, 20)}-${originalString.slice(20)}`;
  }
  return originalString;
};

export const isMock = (pageId: string) => pageId === "mock";

export const mockIdPage = "9cd12535-3e60-4493-bc03-b5ace2e01986";

export const createOrUpdateNode = (
  id: string,
  pageItem: INotionPage,
): { nodes: Node[]; links: Link[] } => {
  let existingData;

  if (id === mockIdPage) {
    existingData = saveStorage.get(localStorageKey("mock")) || [];
  } else {
    existingData = saveStorage.get(localStorageKey(id)) || [];
  }

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

  console.log(existingData);
  const updatedNodes = [...existingData, ...nodes.nodes, ...nodes.links];

  if (id === mockIdPage) {
    saveStorage.set(localStorageKey("mock"), updatedNodes);
  } else {
    saveStorage.set(localStorageKey(id), updatedNodes);
  }

  return nodes;
};
