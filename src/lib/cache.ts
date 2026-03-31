export const setCache = (key: string, data: any, expiryInMinutes: number) => {
  const now = new Date();
  const item = {
    value: data,
    expiry: now.getTime() + expiryInMinutes * 60 * 1000,
  };
  try {
    localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.warn('Error setting cache:', error);
  }
};

export const getCache = (key: string) => {
  try {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    const item = JSON.parse(itemStr);
    const now = new Date();

    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  } catch (error) {
    console.warn('Error reading cache:', error);
    return null;
  }
};
