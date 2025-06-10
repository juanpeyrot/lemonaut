import { Request } from "./request";
import { Response } from "./response";
import { NextFunction } from "../types";

export const CookieParser = () => {
  return (req: Request, _res: Response, next: NextFunction) => {
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