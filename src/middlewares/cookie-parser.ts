import { IRequest, IResponse, Middleware, NextFunction } from "../types/index.js";

export const CookieParser = (): Middleware => {
  return (req: IRequest, _res: IResponse, next: NextFunction) => {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) {
      req.cookies = {};
      return next();
    }

    const cookies: Record<string, string> = {};
    cookieHeader.split(";").forEach((cookie) => {
      const [key, ...val] = cookie.trim().split("=");
      cookies[key] = decodeURIComponent(val.join("="));
    });

    req.cookies = cookies;
    next();
  };
};