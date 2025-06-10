import { HttpStatus } from "../constants";
import { HttpError } from "../errors";
import { Middleware, NextFunction } from "../types";
import { Request } from "./request";
import { Response } from "./response";

export const ErrorHandler: Middleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await next();
  } catch (err) {
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal Server Error";

    if (err instanceof HttpError) {
      statusCode = err.statusCode;
      message = err.message;
    } else if (err instanceof Error) {
      message = err.message;
    }

    res.statusCode = statusCode;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: message }));

    console.error(err);
  }
};