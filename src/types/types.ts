import { DecoratedRequest } from "../middlewares/request";
import { DecoratedResponse } from "../middlewares/response";

export type Handler = (
  req: DecoratedRequest,
  res: DecoratedResponse
) => unknown;

export type Middleware = (
  req: DecoratedRequest,
  res: DecoratedResponse,
  next: () => Promise<void> | void
) => Promise<void> | void;

export type RouteHandler = Handler | Middleware;