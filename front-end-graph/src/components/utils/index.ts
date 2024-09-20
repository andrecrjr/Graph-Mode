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
