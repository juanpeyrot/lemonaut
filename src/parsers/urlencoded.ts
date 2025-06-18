import { IRequest, IResponse, Middleware, NextFunction } from "../types/index.js";
import { Parser } from "../types/index.js";
import { registerParser } from "./registry.js";
import qs from "qs";

const URLEncodedParserImpl: Parser = (contentType, rawBody) => {
  if (contentType.includes("application/x-www-form-urlencoded")) {
    return qs.parse(rawBody);
  }
};

export const URLEncodedParser = (): Middleware => {
  registerParser(URLEncodedParserImpl);
  return (_req: IRequest, _res: IResponse, next: NextFunction) => {
    next();
  };
};