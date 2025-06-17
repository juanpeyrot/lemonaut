import { match } from "path-to-regexp";

export const matchUrl = (
  urlKey: string,
  routeMap: Map<string, any>
): string | null => {
  for (const routeKey of routeMap.keys()) {
    const parts = routeKey.split("/");
    const method = parts.pop();
    const routePath = "/" + parts.join("/");

    const urlParts = urlKey.split("/");
    const urlMethod = urlParts.pop();
    const urlPath = "/" + urlParts.join("/");

    if (method !== urlMethod) continue;

    const matcher = match(routePath, { decode: decodeURIComponent });
    const matched = matcher(urlPath);

    if (matched) {
      return routeKey;
    }
  }

  return null;
};