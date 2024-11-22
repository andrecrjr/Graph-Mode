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
  getAll: () => {
    return globalThis.localStorage;
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
  pageId: string,
): { nodes: Node[]; links: Link[] } => {
  let existingData;
  if (pageId === mockIdPage) {
    existingData = saveStorage.get(localStorageKey("mock")) || [];
  } else {
    existingData = saveStorage.get(localStorageKey(pageId)) || [];
  }
  console.log(id);
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
        target: id.includes("-") ? id : uuidFormatted(id),
        type: "node",
      },
    ],
  };

  const updatedNodes = [...existingData, ...nodes.nodes, ...nodes.links];

  if (pageId === mockIdPage) {
    saveStorage.set(localStorageKey("mock"), updatedNodes);
  } else {
    saveStorage.set(localStorageKey(pageId), updatedNodes);
  }

  return nodes;
};

export const convertDateToIntl = (dateString: number) => {
  try {
    // Garante que é uma instância válida de Date
    if (typeof window === "undefined") {
      // Garantir que não seja executado no servidor
      return "Date unavailable on server";
    }

    const date = new Date(dateString);

    // Usa a formatação padrão (idioma e opções personalizáveis)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date"; // Retorna uma string padrão em caso de erro
  }
};
