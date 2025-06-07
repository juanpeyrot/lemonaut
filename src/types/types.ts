import { IncomingMessage, ServerResponse } from "http";
import { DecoratedRequest } from "../request";
import { DecoratedResponse } from "../response";

export type Handler = (
  req: DecoratedRequest,
  res: DecoratedResponse
) => void | Promise<void>;

export type Middleware = (
  req: DecoratedRequest,
  res: DecoratedResponse,
  next: () => Promise<void> | void
) => Promise<void> | void;