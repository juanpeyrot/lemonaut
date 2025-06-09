import { DecoratedRequest, DecoratedResponse } from "../middlewares";
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
  return (_req: DecoratedRequest, _res: DecoratedResponse, next: NextFunction) => {
    next();
  };
};