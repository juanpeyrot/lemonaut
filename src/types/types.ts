import { Request } from "../middlewares/request";
import { Response } from "../middlewares/response";

export type Handler = (
  req: Request,
  res: Response
) => unknown;

export type Middleware = (
  req: Request,
  res: Response,
  next: () => Promise<void> | void
) => Promise<void> | void;

export type RouteHandler = Handler | Middleware;
export type NextFunction = () => Promise<void> | void;