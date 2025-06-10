import { Request } from "./request";
import { Response } from "./response";
import { Middleware, NextFunction } from "../types";

export const LoggerMiddleware: Middleware = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const { method, url } = req;
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${method} ${url}`);
  next();
};