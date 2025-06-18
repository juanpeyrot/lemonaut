import { HttpStatus } from "../constants/index.js";
import { HttpError } from "../errors/index.js";
import { Middleware, NextFunction, IRequest, IResponse } from "../types/index.js";

export const ErrorHandler: Middleware = async (
  req: IRequest,
  res: IResponse,
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