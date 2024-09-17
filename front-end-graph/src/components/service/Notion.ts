export const fetchServer = async <T>(
  url: string,
  token: string,
  options: RequestInit = {},
): Promise<T> => {
  const fetchMetadata: RequestInit = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    ...options,
  };

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_API}${url}`,
      fetchMetadata,
    );

    if (!response.ok) {
      const errorDetails = await response.json();
      throw new Error(`Failed to fetch data: ${errorDetails.message}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    throw new Error(`Fetch error: ${error}`);
  }
};
