export const joinPaths = (...segments: string[]): string =>
  "/" +
  segments
    .map((s) => s.replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("/");