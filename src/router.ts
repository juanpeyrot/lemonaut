import { Handler, Middleware, MiddlewareOrRouter, RouteMap, RouterInstance } from "./types";

const Router = (): RouterInstance => {
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
          "getRoutes" in (item as RouterInstance) &&
          typeof (item as RouterInstance).getRoutes === "function"
        ) {
          const childRouter = item as RouterInstance;
          const childRoutes = childRouter.getRoutes();

          childRoutes.forEach((handlers, key) => {
            const match = key.match(/(.*)\/(GET|POST|PUT|PATCH|DELETE)$/);
            if (!match) return;
            const [, routePath, method] = match;

            const newPath = `${pathPrefix}${routePath}`;
            const newKey = `${newPath}/${method}`;

            const existing = routes.get(newKey) || [];
            routes.set(newKey, [...middlewares, ...existing, ...handlers]);
          });
        }
      }

      if (middlewares.length > 0) {
        const possiblePaths = [
          `${pathPrefix}/GET`,
          `${pathPrefix}/POST`,
          `${pathPrefix}/PUT`,
          `${pathPrefix}/PATCH`,
          `${pathPrefix}/DELETE`,
        ];

        possiblePaths.forEach((route) => {
          const existingHandlers = routes.get(route) || [];
          routes.set(route, [...middlewares, ...existingHandlers]);
        });
      }
    } else {
      const middlewares = args as Middleware[];
      middlewaresForAll.push(...middlewares);
    }
  };

  const get = (path: string, ...handlers: Handler[]) => {
    const key = `${path}/GET`;
    const existing = routes.get(key) || [];
    routes.set(key, [...existing, ...handlers]);
  };

  const post = (path: string, ...handlers: Handler[]) => {
    const key = `${path}/POST`;
    const existing = routes.get(key) || [];
    routes.set(key, [...existing, ...handlers]);
  };

  const put = (path: string, ...handlers: Handler[]) => {
    const key = `${path}/PUT`;
    const existing = routes.get(key) || [];
    routes.set(key, [...existing, ...handlers]);
  };

  const patch = (path: string, ...handlers: Handler[]) => {
    const key = `${path}/PATCH`;
    const existing = routes.get(key) || [];
    routes.set(key, [...existing, ...handlers]);
  };

  const del = (path: string, ...handlers: Handler[]) => {
    const key = `${path}/DELETE`;
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

export default Router;
