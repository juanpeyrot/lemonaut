import { getRegisteredParsers } from "../parsers/registry.js";
import { Middleware, NextFunction, IRequest, IResponse } from "../types/index.js";

export const BodyParser: Middleware = async (
  req: IRequest,
  res: IResponse,
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