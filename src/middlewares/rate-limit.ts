import { IncomingMessage, ServerResponse } from "http";
import { Middleware, NextFunction } from "../types";

interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  message?: string;
}

const ipMap = new Map<string, { count: number; start: number }>();

export const rateLimit = (options?: RateLimitOptions): Middleware => {
  const windowMs = options?.windowMs ?? 60_000;
  const max = options?.max ?? 60;
  const message = options?.message ?? "Too many requests";

  return (req: IncomingMessage, res: ServerResponse, next: NextFunction) => {
    const ip = req.socket.remoteAddress || "unknown";

    const now = Date.now();
    const record = ipMap.get(ip);

    if (!record || now - record.start > windowMs) {
      ipMap.set(ip, { count: 1, start: now });
      return next();
    }

    if (record.count < max) {
      record.count++;
      return next();
    }

    res.statusCode = 429;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: message }));
  };
};