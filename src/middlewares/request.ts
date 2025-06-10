import { IncomingMessage, ServerResponse } from "http";
import { match, MatchFunction } from "path-to-regexp";
import { parse } from "url";

type Params = Record<string, string>;
type Query = Record<string, string | string[]>;

export interface Request extends IncomingMessage {
  params?: Params;
  query?: Query;
  body?: string | Record<string, any>;
	cookies?: Record<string, string>;
}

type MiddlewareWithRoutes = (
  routes: IterableIterator<string>,
  req: Request,
  res: ServerResponse,
  next: () => void
) => void;

const RequestDecorator: MiddlewareWithRoutes = (
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

export default RequestDecorator;