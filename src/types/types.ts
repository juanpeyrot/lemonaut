import { Request } from "../middlewares/request";
import { Response } from "../middlewares/response";

interface BaseHttpMethods {
  get: (path: string, ...handlers: Handler[]) => void;
  post: (path: string, ...handlers: Handler[]) => void;
  put: (path: string, ...handlers: Handler[]) => void;
  patch: (path: string, ...handlers: Handler[]) => void;
  delete: (path: string, ...handlers: Handler[]) => void;
  use: (...args: [Middleware] | [string, ...MiddlewareOrRouter[]]) => void;
  useMany: (...handlers: Middleware[]) => void;
}

export interface AppInstance extends BaseHttpMethods {
  useRouter: (path: string, router: RouterInstance) => void;
  serveStatic: (folderPath: string) => Promise<void>;
  run: (port: number) => void;
}

export interface RouterInstance extends BaseHttpMethods {
  getRoutes: () => RouteMap;
  getMiddlewaresForAll: () => Middleware[];
}

export type RouteMap = Map<string, RouteHandler[]>;

export type Handler = (
  req: Request,
  res: Response
) => unknown;

export type Middleware = (
  req: Request,
  res: Response,
  next: () => Promise<void> | void
) => Promise<void> | void;

export type MiddlewareOrRouter = Middleware | RouterInstance;

export type RouteHandler = Handler | Middleware;
export type NextFunction = () => Promise<void> | void;