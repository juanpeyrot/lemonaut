import { Request, Response } from "../middlewares";
import { NextFunction } from "../router";
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

export const JSONParser = () => {
  registerParser(JSONParserImpl);
  return (_req: Request, _res: Response, next: NextFunction) => {
    next();
  };
};