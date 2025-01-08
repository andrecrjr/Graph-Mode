import { IS_DEVELOPMENT } from "../utils";

export const fetchServer = async <T>(
  url: string,
  token: string,
  options: RequestInit = {},
  isBackend = false,
): Promise<T> => {
  const DEFAULT_HEADERS = {
    "Content-Type": "application/json",
  };

  const fetchMetadata: RequestInit = {
    headers: {
      Authorization: `Bearer ${token}`,
      ...DEFAULT_HEADERS,
      ...options.headers,
    },
    ...options,
  };
  const API_ENDPOINT =
    IS_DEVELOPMENT && isBackend
      ? process.env.SERVER_API
      : process.env.NEXT_PUBLIC_SERVER_API;

  try {
    const response = await fetch(`${API_ENDPOINT}${url}`, fetchMetadata);

    if (!response.ok) {
      const resp = await response.json();
      throw new Error(
        `${resp.message || "An unexpected error has ocurred, please try again in few minutes!"}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao fazer requisição:", error);
    throw error;
  }
};

export const fetchNotionServer = async <T>(
  url: string,
  token: string,
  options: RequestInit = {},
): Promise<T> => {
  const fetchMetadata: RequestInit = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    ...options,
  };

  try {
    const response = await fetch(`${url}`, fetchMetadata);

    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    throw new Error(`Fetch error: ${error}`);
  }
};
