import { createServer } from "http";
import { Handler, Middleware } from "./types";
import RequestDecorator, { DecoratedRequest } from "./middlewares/request";
import ResponseDecorator, { DecoratedResponse } from "./middlewares/response";
import Router, { RouterInstance } from "./router";
import { dispatchChain, matchUrl } from "./utils";
import { readdir } from "fs/promises";
import fs, { createReadStream } from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import mime from "mime-types";

export interface AppInstance {
  get: (path: string, ...handlers: Handler[]) => void;
  post: (path: string, ...handlers: Handler[]) => void;
  put: (path: string, ...handlers: Handler[]) => void;
  patch: (path: string, ...handlers: Handler[]) => void;
  delete: (path: string, ...handlers: Handler[]) => void;
  use: (...args: [Middleware] | [string, ...Middleware[]]) => void;
  useMany: (...handlers: Middleware[]) => void;
  useRouter: (path: string, router: RouterInstance) => void;
  serveStatic: (folderPath: string) => Promise<void>;
  run: (port: number) => void;
}

const App = (): AppInstance => {
  const internalRouter = Router();

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
      if (!(request as any)._wasHandled && !response.writableEnded) {
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

  const serveStatic = async function (folderPath: string) {
    const absoluteBasePath = path.resolve(folderPath);

    for await (const file of getAllStaticFiles(absoluteBasePath)) {
      const relativePath = path
        .relative(absoluteBasePath, file)
        .replace(/\\/g, "/");
      const routePath = "/" + relativePath;

      internalRouter.get(
        routePath,
        async (req: DecoratedRequest, res: DecoratedResponse) => {
          try {
            let stats;
            try {
              stats = fs.statSync(file);
            } catch {
              res.statusCode = 404;
              res.end("Not Found");
              return;
            }

            const mimeType = mime.lookup(file) || "application/octet-stream";

            const etag = `${stats.size}-${stats.mtimeMs}`;

            res.setHeader("Content-Type", mimeType);
            res.setHeader("ETag", etag);

            if (req.headers["if-none-match"] === etag) {
              res.statusCode = 304;
              res.end();
              return;
            }

            const fileStream = createReadStream(file);
            await pipeline(fileStream, res);
          } catch (error) {
            res.statusCode = 500;
            res.end("Internal Server Error");
          }
        }
      );
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
    useMany: internalRouter.useMany,
    useRouter,
    serveStatic: serveStatic,
    run,
  };
};

export default App;