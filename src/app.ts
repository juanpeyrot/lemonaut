import { createServer } from "http";
import { Handler, Middleware, RouteHandler } from "./types";
import RequestDecorator, { DecoratedRequest } from "./request";
import ResponseDecorator, { DecoratedResponse } from "./response";
import Router, { RouterInstance } from "./router";
import { dispatchChain, matchUrl } from "./utils";
import { readdir } from "fs/promises";
import path from "path";
import { createReadStream, statSync } from "fs";
import { pipeline } from "stream";

export interface AppInstance {
  get: (path: string, ...handlers: Handler[]) => void;
  post: (path: string, ...handlers: Handler[]) => void;
  put: (path: string, ...handlers: Handler[]) => void;
  patch: (path: string, ...handlers: Handler[]) => void;
  delete: (path: string, ...handlers: Handler[]) => void;
  use: (...args: [Middleware] | [string, ...Middleware[]]) => void;
  useAll: (...handlers: Middleware[]) => void;
  useRouter: (path: string, router: RouterInstance) => void;
  serveStatic: (folderPath: string) => Promise<void>;
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

    let globalMiddlewares = internalRouter.getMiddlewaresForAll();

    const commonHandlers = [
      RequestDecorator.bind(null, internalRouter.getRoutes().keys()),
      ResponseDecorator,
      ...globalMiddlewares,
    ];

    const matchedRoute = matchUrl(sanitizedUrl, internalRouter.getRoutes());

    if (matchedRoute) {
      const routeHandlers = internalRouter.getRoutes().get(matchedRoute) || [];
      await dispatchChain(request, response, [
        ...commonHandlers,
        ...routeHandlers,
      ]);
    } else {
      await dispatchChain(request, response, commonHandlers);
      if (!response.writableEnded) {
        response.statusCode = 404;
        response.end("Not Found");
      }
    }
  };

  async function* getAllStaticFiles(folder: string): AsyncGenerator<string> {
    const entries = await readdir(folder, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(folder, entry.name);

      if (entry.isDirectory()) {
        yield* getAllStaticFiles(fullPath);
      } else {
        yield fullPath;
      }
    }
  }

  const serveStatic = async (folderPath: string) => {
    const absoluteBase = path.resolve(folderPath);

    for await (const file of getAllStaticFiles(absoluteBase)) {
      const pathWithoutBase = file.replace(absoluteBase, "");
      const routePath = pathWithoutBase.startsWith("/")
        ? pathWithoutBase
        : "/" + pathWithoutBase;

      internalRouter.get(routePath, async (req, res) => {
        const stream = createReadStream(file);
        const ext = path.extname(file).slice(1) || "text/plain";
        res.setHeader("Content-Type", ext);
        await new Promise<void>((resolve, reject) =>
          pipeline(stream, res, (err) => (err ? reject(err) : resolve()))
        );
        (req as any)._wasHandled = true;
      });
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
    useAll: internalRouter.useAll,
    useRouter,
    serveStatic,
    run,
  };
};

export default App;
