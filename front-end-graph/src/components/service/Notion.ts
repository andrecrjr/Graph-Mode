import { IS_DEVELOPMENT } from "../utils";

export const fetchServer = async <T>(
  url: string,
  token: string,
  options: RequestInit = {},
  isBackend = false,
): Promise<T> => {
  const fetchMetadata: RequestInit = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    ...options,
  };

  try {
    let endpoint =
      IS_DEVELOPMENT && isBackend
        ? process.env.SERVER_API
        : process.env.NEXT_PUBLIC_SERVER_API;
    let endpointServer = endpoint + url;
    const response = await fetch(`${endpointServer}`, fetchMetadata);

    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    throw new Error(`Fetch error: ${error}`);
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
