import { createServer } from "http";
import { match, MatchFunction } from "path-to-regexp";
import { Handler, Middleware } from "./types";
import RequestDecorator, { DecoratedRequest } from "./request";
import ResponseDecorator, { DecoratedResponse } from "./response";

type RouteKey = string;
type RouteMap = Map<RouteKey, Middleware[]>;

interface AppInstance {
  run: (port: number) => void;
  get: (path: string, ...handlers: Handler[]) => void;
  post: (path: string, ...handlers: Handler[]) => void;
  put: (path: string, ...handlers: Handler[]) => void;
  patch: (path: string, ...handlers: Handler[]) => void;
  delete: (path: string, ...handlers: Handler[]) => void;
}

const App = (): AppInstance => {
  const routes: RouteMap = new Map();

  const createMyServer = () =>
    createServer(async (req, res) => {
      const decoratedReq = req as DecoratedRequest;
      const decoratedRes = res as DecoratedResponse;

      await serverHandler(decoratedReq, decoratedRes);
    });

  const get = (path: string, ...handlers: Handler[]) => {
    const currentHandlers = routes.get(`${path}/GET`) || [];
		routes.set(`${path}/GET`, [...currentHandlers, ...handlers]);
  };

  const post = (path: string, ...handlers: Handler[]) => {
    const currentHandlers = routes.get(`${path}/POST`) || [];
    routes.set(`${path}/POST`, [...currentHandlers, ...handlers]);
  };

  const put = (path: string, ...handlers: Handler[]) => {
    const currentHandlers = routes.get(`${path}/PUT`) || [];
    routes.set(`${path}/PUT`, [...currentHandlers, ...handlers]);
  };

  const patch = (path: string, ...handlers: Handler[]) => {
    const currentHandlers = routes.get(`${path}/PATCH`) || [];
    routes.set(`${path}/PATCH`, [...currentHandlers, ...handlers]);
  };

  const del = (path: string, ...handlers: Handler[]) => {
    const currentHandlers = routes.get(`${path}/DELETE`) || [];
    routes.set(`${path}/DELETE`, [...currentHandlers, ...handlers]);
  };

  const middlewaresForAll: Middleware[] = [];

  const use = (path: string, ...middlewares: Middleware[]) => {
    const methods = ["GET", "POST", "PUT", "PATCH", "DELETE"];
    const possiblePaths = methods.map((method) => `${path}/${method}`);

    possiblePaths.forEach((route) => {
      const existingHandlers = routes.get(route) || [];
      if (existingHandlers.length) {
        routes.set(route, [...middlewares, ...existingHandlers]);
      }
    });
  };

  const useAll = (...middlewares: Middleware[]) => {
    middlewaresForAll.push(...middlewares);
  };

  const parseURLToRouteMap = (
    url: string | undefined,
    method: string | undefined
  ) => {
    if (!url || !method) return "";
    const urlParams = url.split("/").slice(1);

    const [lastParam] = urlParams[urlParams.length - 1].split("?");
    urlParams.splice(urlParams.length - 1, 1);

    const allParams = [...urlParams, lastParam].join("/");
    const parsedUrl = `/${allParams}/${method.toUpperCase()}`;

    return parsedUrl;
  };

  const matchUrl = (parsedUrl: string): string | false => {
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

  const dispatchChain = (
    request: DecoratedRequest,
    response: DecoratedResponse,
    middlewares: Middleware[]
  ) => {
    return invokeMiddlewares(request, response, middlewares);
  };

  const invokeMiddlewares = async (
    request: DecoratedRequest,
    response: DecoratedResponse,
    middlewares: Middleware[]
  ) => {
    if (!middlewares.length) return;

    const currentMiddleware = middlewares[0];

    return currentMiddleware(request, response, async () => {
      await invokeMiddlewares(request, response, middlewares.slice(1));
    });
  };

  const serverHandler = async (
    request: DecoratedRequest,
    response: DecoratedResponse
  ) => {
    const sanitizedUrl = parseURLToRouteMap(request.url, request.method);

    const match = matchUrl(sanitizedUrl);

    if (match) {
      const middlewaresAndControllers = routes.get(match);
      if (middlewaresAndControllers) {
        await dispatchChain(request, response, [
          RequestDecorator.bind(null, routes.keys()),
          ResponseDecorator,
          ...middlewaresAndControllers,
        ]);
      }
    } else {
      response.statusCode = 404;
      response.end("Not found");
    }
  };

  const run = (port: number) => {
    const server = createMyServer();
    server.listen(port);
  };

  return {
    run,
    get,
    post,
    patch,
    put,
    delete: del,
  };
};

export default App;
