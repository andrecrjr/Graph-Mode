export const fetchServer = async (url: string, token: string, options = {}) => {
  const fetchMetadata = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    ...options,
  };

  const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_API}${url}`, {
    ...fetchMetadata,
  });
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  return await response.json();
};
