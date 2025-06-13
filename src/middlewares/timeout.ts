import { Middleware } from "../types";

export const timeout = (limitMs = 10000): Middleware => {
  return (req, res, next) => {
    const timer = setTimeout(() => {
      if (!res.writableEnded) {
        res.statusCode = 503;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Request timed out" }));
      }
    }, limitMs);

    const originalEnd = res.end.bind(res);
    res.end = function(
      chunk?: any,
      encoding?: BufferEncoding | (() => void),
      cb?: () => void
    ) {
      clearTimeout(timer);
      
      if (typeof chunk === 'function') {
        return originalEnd(chunk);
      }
      if (typeof encoding === 'function') {
        return originalEnd(chunk, encoding);
      }
      return originalEnd(chunk, encoding as BufferEncoding, cb);
    };

    next();
  };
};