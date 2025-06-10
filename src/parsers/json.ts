import { Request, Response } from "../middlewares";
import { Middleware, NextFunction } from "../types";
import { Parser } from "../types";
import { registerParser } from "./registry";

const JSONParserImpl: Parser = (contentType, rawBody) => {
  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(rawBody);
    } catch {
      return undefined;
    }
  }
};

export const JSONParser = (): Middleware => {
  registerParser(JSONParserImpl);
  return (_req: Request, _res: Response, next: NextFunction) => {
    next();
  };
};