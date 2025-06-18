import { ServerResponse } from "http";
import { match, MatchFunction } from "path-to-regexp";
import { IRequest, Query } from "../types/types.js";
import { parse } from "url";

type MiddlewareWithRoutes = (
  routes: IterableIterator<string>,
  req: IRequest,
  res: ServerResponse,
  next: () => void
) => void;

export const Request: MiddlewareWithRoutes = (
  routes,
  request,
  response,
  next
) => {
  const pathname = request.url?.split("?")[0] || "/";

  for (const route of routes) {
    const parts = route.split("/");
    const method = parts.pop();
    const path = parts.join("/");

    if (request.method?.toUpperCase() !== method) continue;

    const urlMatch: MatchFunction<Record<string, string>> = match(path, {
      decode: decodeURIComponent,
    });

    const found = urlMatch(pathname);
    if (found) {
      request.params = found.params;
      break;
    }
  }

  const parsed = parse(request.url || "", true);
  request.query = parsed.query as Query;

  next();
};