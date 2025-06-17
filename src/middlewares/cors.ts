import { IRequest, IResponse, Middleware, NextFunction } from "../types";

interface CORSOptions {
  origin?: string | string[];
  methods?: string[];
  headers?: string[];
  credentials?: boolean;
}

export const CORS = (options: CORSOptions = {}): Middleware => {
  const {
    origin = "*",
    methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    headers = ["Content-Type", "Authorization"],
    credentials = false,
  } = options;

  return (req: IRequest, res: IResponse, next: NextFunction) => {
    const requestOrigin = req.headers.origin;

    let allowedOrigin = "*";

    if (Array.isArray(origin)) {
      if (requestOrigin && origin.includes(requestOrigin)) {
        allowedOrigin = requestOrigin;
      }
    } else {
      allowedOrigin = origin;
    }

    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    res.setHeader("Access-Control-Allow-Methods", methods.join(","));
    res.setHeader("Access-Control-Allow-Headers", headers.join(","));
    if (credentials) {
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }

    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.end();
    } else {
      next();
    }
  };
};