import { Handler, Middleware, RouteHandler } from "./types";

type RouteMap = Map<string, RouteHandler[]>;

export interface RouterInstance {
  get: (path: string, ...handlers: Handler[]) => void;
  post: (path: string, ...handlers: Handler[]) => void;
  put: (path: string, ...handlers: Handler[]) => void;
  patch: (path: string, ...handlers: Handler[]) => void;
  delete: (path: string, ...handlers: Handler[]) => void;
  use: (...args: [Middleware] | [string, ...Middleware[]]) => void;
  useMany: (...handlers: Middleware[]) => void;
  getRoutes: () => RouteMap;
  getMiddlewaresForAll: () => Middleware[];
}

const Router = (): RouterInstance => {
  const routes: RouteMap = new Map();
  const middlewaresForAll: Middleware[] = [];

  const getRoutes = () => routes;
  const getMiddlewaresForAll = () => middlewaresForAll;

  const useMany = (...middlewares: Middleware[]) => {
    middlewaresForAll.push(...middlewares);
  };

  const use = (...args: [Middleware] | [string, ...Middleware[]]) => {
    if (typeof args[0] === "string") {
      const path = args[0];
      const middlewares = args.slice(1) as Middleware[];
      const possiblePaths = [
        `${path}/GET`,
        `${path}/POST`,
        `${path}/PUT`,
        `${path}/PATCH`,
        `${path}/DELETE`,
      ];

      possiblePaths.forEach((route) => {
        const existingHandlers = routes.get(route) || [];
        routes.set(route, [...middlewares, ...existingHandlers]);
      });
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