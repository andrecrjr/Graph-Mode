export const saveStorage = {
  set: (key: string, data: object) => {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  },
  get: (key: string) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },
  delete: (key: string) => {
    localStorage.removeItem(key);
    return true;
  },
};

export const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
