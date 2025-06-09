import { IncomingMessage, ServerResponse } from "http";
import { match, MatchFunction } from "path-to-regexp";

type Params = Record<string, string>;
type Query = Record<string, string>;

export interface DecoratedRequest extends IncomingMessage {
  params?: Params;
  query?: Query;
	body?: string | Record<string, any>;
}

type MiddlewareWithRoutes = (
	routes: IterableIterator<string>,
  req: DecoratedRequest,
  res: ServerResponse,
  next: () => void
) => void;

const RequestDecorator: MiddlewareWithRoutes = (
  routes: IterableIterator<string>,
  request: DecoratedRequest,
  response: ServerResponse,
  next: () => void
) => {
  const getParams = () => {
    const urlParams = request.url?.split("/").slice(1) || [];

    const [lastParam = ""] = urlParams[urlParams.length - 1]?.split("?") || [];
    urlParams.splice(urlParams.length - 1, 1);

    const allParams = [...urlParams, lastParam].join("/");
    const method = request.method?.toUpperCase();

    for (const path of routes) {
      const urlMatch: MatchFunction<Record<string, string>> = match(path, {
        decode: decodeURIComponent,
      });
      const url = `/${allParams}/${method}`;
      const found = urlMatch(url);

      if (found) {
        request.params = {
          ...request.params,
          ...found.params,
        };
        break;
      }
    }
  };

  const getQuery = () => {
    const urlParams = request.url?.split("/").slice(1) || [];
    const [lastParam, queryString = ""] =
      urlParams[urlParams.length - 1]?.split("?") || [];

    const params = new URLSearchParams(queryString);
    const entries = params.entries();

    request.query = {
      ...request.query,
      ...Object.fromEntries(entries),
    };
  };

  getParams();
  getQuery();
  next();
};

export default RequestDecorator;