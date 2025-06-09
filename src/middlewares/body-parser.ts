import { getRegisteredParsers } from "../parsers/registry";
import { NextFunction } from "../router";
import { DecoratedRequest } from "./request";
import { DecoratedResponse } from "./response";

export const BodyParserMiddleware = async (
  req: DecoratedRequest,
  res: DecoratedResponse,
  next: NextFunction
) => {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const rawBody = Buffer.concat(chunks).toString();
	console.log("Raw body:", rawBody);
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