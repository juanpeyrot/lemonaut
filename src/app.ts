import { createServer } from "http";
import { Handler, Middleware, RouteHandler } from "./types";
import RequestDecorator, { DecoratedRequest } from "./request";
import ResponseDecorator, { DecoratedResponse } from "./response";
import Router, { RouterInstance } from "./router";
import { matchUrl } from "./utils";

interface AppInstance {
  get: (path: string, ...handlers: Handler[]) => void;
  post: (path: string, ...handlers: Handler[]) => void;
  put: (path: string, ...handlers: Handler[]) => void;
  patch: (path: string, ...handlers: Handler[]) => void;
  delete: (path: string, ...handlers: Handler[]) => void;
  use: (path: string, ...handlers: Middleware[]) => void;
  useAll: (...handlers: Middleware[]) => void;
  useRouter: (path: string, router: RouterInstance) => void;
  run: (port: number) => void;
}

const App = (): AppInstance => {
  const internalRouter = Router();

  const globalMiddlewares: Middleware[] = [];

  const parseURLToRouteMap = (
    url: string | undefined,
    method: string | undefined
  ) => {
    if (!url || !method) return "";
    const urlParams = url.split("/").slice(1);
    const [lastParam] = urlParams[urlParams.length - 1].split("?");
    urlParams.splice(urlParams.length - 1, 1);
    const allParams = [...urlParams, lastParam].join("/");
    return `/${allParams}/${method.toUpperCase()}`;
  };

  const dispatchChain = (
    request: DecoratedRequest,
    response: DecoratedResponse,
    handlers: RouteHandler[]
  ): Promise<void> => {
    return invokeHandlers(request, response, handlers, 0);
  };

  const invokeHandlers = async (
    request: DecoratedRequest,
    response: DecoratedResponse,
    handlers: RouteHandler[],
    index: number
  ): Promise<void> => {
    if (index >= handlers.length) return;

    const current = handlers[index];

    if (current.length === 3) {
      const middleware = current as Middleware;
      await middleware(request, response, () =>
        invokeHandlers(request, response, handlers, index + 1)
      );
    } else {
      const handler = current as Handler;
      await handler(request, response);
    }
  };

  const useRouter = (base: string, router: RouterInstance) => {
    const externalRoutes = router.getRoutes();
    externalRoutes.forEach((handlers, key) => {
      const fullPath = `${base}${key}`;
      const existing = internalRouter.getRoutes().get(fullPath) || [];
      internalRouter.getRoutes().set(fullPath, [...existing, ...handlers]);
    });
  };

  const serverHandler = async (
    request: DecoratedRequest,
    response: DecoratedResponse
  ) => {
    const sanitizedUrl = parseURLToRouteMap(
      request.url || "",
      request.method || "GET"
    );

    const matchedRoute = matchUrl(sanitizedUrl, internalRouter.getRoutes());

    if (matchedRoute) {
      const handlers = internalRouter.getRoutes().get(matchedRoute) || [];

      await dispatchChain(request, response, [
        RequestDecorator.bind(null, internalRouter.getRoutes().keys()),
        ResponseDecorator,
        ...globalMiddlewares,
        ...internalRouter.getMiddlewaresForAll(),
        ...handlers,
      ]);
    } else {
      response.statusCode = 404;
      response.end("Not Found");
    }
  };

  const run = (port: number) => {
    const server = createServer((req, res) =>
      serverHandler(req as DecoratedRequest, res as DecoratedResponse)
    );
    server.listen(port, () => {
      console.log(`🚀 Server running on PORT: ${port}`);
    });
  };

  return {
    get: internalRouter.get,
    post: internalRouter.post,
    put: internalRouter.put,
    patch: internalRouter.patch,
    delete: internalRouter.delete,
    use: internalRouter.use,
    useAll: (...middlewares) => {
      globalMiddlewares.push(...middlewares);
    },
    useRouter,
    run,
  };
};

export default App;
