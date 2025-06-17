import { Handler, Middleware, RouterInstance } from "./types";
import { MiddlewareOrRouter, RouteMap } from "./types/types";
import { joinPaths } from "./utils";

export const Router = (): RouterInstance => {
  const routes: RouteMap = new Map();
  const middlewaresForAll: Middleware[] = [];

  const getRoutes = () => routes;
  const getMiddlewaresForAll = () => middlewaresForAll;

  const useMany = (...middlewares: Middleware[]) => {
    middlewaresForAll.push(...middlewares);
  };

  const use = (...args: [Middleware] | [string, ...MiddlewareOrRouter[]]) => {
    if (typeof args[0] === "string") {
      const pathPrefix = args[0];
      const rest = args.slice(1);

      const middlewares: Middleware[] = [];

      for (const item of rest) {
        if (typeof item === "function") {
          middlewares.push(item);
        } else if (
          typeof item === "object" &&
          typeof item.getRoutes === "function"
        ) {
          const childRouter = item as RouterInstance;
          const childRoutes = childRouter.getRoutes();
          const childMiddlewares = childRouter.getMiddlewaresForAll?.() ?? [];

          childRoutes.forEach((handlers, key) => {
            const match = key.match(/(.*)\/(GET|POST|PUT|PATCH|DELETE)$/);
            if (!match) return;

            let [, routePath, method] = match;
            routePath = routePath === "/" ? "" : routePath;
            const newPath = joinPaths(pathPrefix, routePath);
            const newKey = `${newPath}/${method}`;

            const existing = routes.get(newKey) || [];
            routes.set(newKey, [
              ...middlewares,
              ...childMiddlewares,
              ...existing,
              ...handlers,
            ]);
          });
        }
      }

      if (middlewares.length > 0) {
        const methods = ["GET", "POST", "PUT", "PATCH", "DELETE"];
        methods.forEach((method) => {
          const normalizedPrefix = pathPrefix === "/" ? "" : pathPrefix;
          const key = `${joinPaths(normalizedPrefix)}/${method}`;
          const existingHandlers = routes.get(key) || [];
          routes.set(key, [...middlewares, ...existingHandlers]);
        });
      }
    } else {
      const middlewares = args as Middleware[];
      middlewaresForAll.push(...middlewares);
    }
  };

  const get = (path: string, ...handlers: Handler[]) => {
    const normalizedPath = path === "/" ? "" : path.replace(/\/+$/, "");
    const key = `${normalizedPath}/GET`;
    const existing = routes.get(key) || [];
    routes.set(key, [...existing, ...handlers]);
  };

  const post = (path: string, ...handlers: Handler[]) => {
    const normalizedPath = path === "/" ? "" : path.replace(/\/+$/, "");
    const key = `${normalizedPath}/POST`;
    const existing = routes.get(key) || [];
    routes.set(key, [...existing, ...handlers]);
  };

  const put = (path: string, ...handlers: Handler[]) => {
    const normalizedPath = path === "/" ? "" : path.replace(/\/+$/, "");
    const key = `${normalizedPath}/PUT`;
    const existing = routes.get(key) || [];
    routes.set(key, [...existing, ...handlers]);
  };

  const patch = (path: string, ...handlers: Handler[]) => {
    const normalizedPath = path === "/" ? "" : path.replace(/\/+$/, "");
    const key = `${normalizedPath}/PATCH`;
    const existing = routes.get(key) || [];
    routes.set(key, [...existing, ...handlers]);
  };

  const del = (path: string, ...handlers: Handler[]) => {
    const normalizedPath = path === "/" ? "" : path.replace(/\/+$/, "");
    const key = `${normalizedPath}/DELETE`;
    const existing = routes.get(key) || [];
    routes.set(key, [...existing, ...handlers]);
  };

  return {
    get,
    post,
    put,
    patch,
    delete: del,
    use,
    useMany,
    getRoutes,
    getMiddlewaresForAll,
  };
};
