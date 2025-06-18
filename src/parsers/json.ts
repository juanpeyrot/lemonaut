import { IRequest, IResponse, Middleware, NextFunction } from "../types/index.js";
import { Parser } from "../types/index.js";
import { registerParser } from "./registry.js";

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
  return (_req: IRequest, _res: IResponse, next: NextFunction) => {
    next();
  };
};