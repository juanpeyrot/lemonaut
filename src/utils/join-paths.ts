export const joinPaths = (...paths: string[]) => {
  const full = paths.join("/").replace(/\/+/g, "/");
  return full.endsWith("/") && full !== "/" ? full.slice(0, -1) : full;
};