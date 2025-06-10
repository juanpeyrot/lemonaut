import { getRegisteredParsers } from "../parsers/registry";
import { Middleware, NextFunction } from "../types";
import { Request } from "./request";
import { Response } from "./response";

export const BodyParserMiddleware: Middleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const rawBody = Buffer.concat(chunks).toString();
  const contentType = req.headers["content-type"] || "";

  const parsers = getRegisteredParsers();
  for (const parser of parsers) {
    const parsed = parser(contentType, rawBody);
    if (parsed !== undefined) {
      (req as any).body = parsed;
      break;
    }
  }

  next();
};