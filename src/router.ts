import { Handler, Middleware, RouteHandler } from "./types";

export type NextFunction = () => void | Promise<void>;

type RouteMap = Map<string, RouteHandler[]>;

export interface RouterInstance {
  get: (path: string, ...handlers: Handler[]) => void;
  post: (path: string, ...handlers: Handler[]) => void;
  put: (path: string, ...handlers: Handler[]) => void;
  patch: (path: string, ...handlers: Handler[]) => void;
  delete: (path: string, ...handlers: Handler[]) => void;
  use: (path: string, ...handlers: Middleware[]) => void;
  useAll: (...handlers: Middleware[]) => void;
  getRoutes: () => RouteMap;
  getMiddlewaresForAll: () => Middleware[];
}

const Router = (): RouterInstance => {
  const routes: RouteMap = new Map();
  const middlewaresForAll: Middleware[] = [];

  const getRoutes = () => routes;
  const getMiddlewaresForAll = () => middlewaresForAll;

  const useAll = (...middlewares: Middleware[]) => {
    middlewaresForAll.push(...middlewares);
  };

  const use = (path: string, ...middlewares: Middleware[]): void => {
    const possiblePaths = [
      `${path}/GET`,
      `${path}/POST`,
      `${path}/PUT`,
      `${path}/PATCH`,
      `${path}/DELETE`,
    ];

    possiblePaths.forEach((route) => {
      const existingHandlers = routes.get(route) || [];
      if (existingHandlers.length) {
        routes.set(route, [...middlewares, ...existingHandlers]);
      }
    });
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
    useAll,
    getRoutes,
    getMiddlewaresForAll,
  };
};

export default Router;
