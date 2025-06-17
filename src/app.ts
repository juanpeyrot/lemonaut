import { createServer } from "http";
import { LemonautApp, RouterInstance } from "./types";
import { Request, Response } from "./middlewares";
import { dispatchChain, matchUrl } from "./utils";
import { Router } from "./router";
import { readdir } from "fs/promises";
import fs, { createReadStream } from "fs";
import { pipeline } from "stream/promises";
import path from "path";
import mime from "mime-types";
import { IRequest, IResponse } from "./types";

export const lemonaut = (): LemonautApp => {
  const internalRouter = Router();

  const normalizePath = (
    url: string | undefined,
    method: string | undefined
  ) => {
    if (!url || !method) return "";

    const cleanUrl = url.split("?")[0].split("#")[0];

    let normalized = cleanUrl.replace(/\/{2,}/g, "/");
    if (normalized.length > 1 && normalized.endsWith("/")) {
      normalized = normalized.slice(0, -1);
    }

    return `${normalized}/${method.toUpperCase()}`;
  };

  const useRouter = (base: string, router: RouterInstance) => {
    const externalRoutes = router.getRoutes();
    externalRoutes.forEach((handlers, key) => {
      const fullPath = `${base}${key}`;
      const existing = internalRouter.getRoutes().get(fullPath) || [];
      internalRouter.getRoutes().set(fullPath, [...existing, ...handlers]);
    });
  };

  const serverHandler = async (request: IRequest, response: IResponse) => {
    const sanitizedUrl = normalizePath(
      request.url || "",
      request.method || "GET"
    );

    let globalMiddlewares = internalRouter.getMiddlewaresForAll();

    const commonHandlers = [
      Request.bind(null, internalRouter.getRoutes().keys()),
      Response,
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

      internalRouter.get(routePath, async (req: IRequest, res: IResponse) => {
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
      });
    }
  };

  const startMission = (port: number) => {
    const server = createServer((req, res) =>
      serverHandler(req as IRequest, res as IResponse)
    );
    server.listen(port, () => {
      console.log(`🚀 Server running on PORT: ${port}`);
    });

		return server;
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
    startMission,
  };
};
