import { Request } from "./request";
import { Response } from "./response";
import { Middleware, NextFunction } from "../types";

export const Logger: Middleware = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const now = new Date().toLocaleString(undefined, {
    hour12: false,
  });

  console.log(`[${now}] ${req.method} ${req.url}`);
  next();
};
