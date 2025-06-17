import { match, MatchFunction } from "path-to-regexp";
import { RouteHandler } from "../types/types";

export const matchUrl = (
  parsedUrl: string,
  routes: Map<string, RouteHandler[]>
): string | false => {
  for (const path of routes.keys()) {
    const urlMatch: MatchFunction<Record<string, string>> = match(path, {
      decode: decodeURIComponent,
    });

    const found = urlMatch(parsedUrl);

    if (found) {
      return path;
    }
  }
  return false;
};
