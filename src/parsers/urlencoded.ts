import { Request, Response } from "../middlewares";
import { NextFunction } from "../router";
import { Parser } from "../types";
import { registerParser } from "./registry";
import qs from "qs";

const URLEncodedParserImpl: Parser = (contentType, rawBody) => {
  if (contentType.includes("application/x-www-form-urlencoded")) {
    return qs.parse(rawBody);
  }
};

export const URLEncodedParser = () => {
  registerParser(URLEncodedParserImpl);
  return (_req: Request, _res: Response, next: NextFunction) => {
    next();
  };
};