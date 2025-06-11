import { IRequest, IResponse } from "./";
import { Middleware, NextFunction } from "../types";

const getIP = (req: IRequest): string => {
  const getHeaderAsString = (header: string | string[] | undefined): string => {
    if (!header) return '';
    return Array.isArray(header) ? header[0] : header;
  };

  const xForwardedFor = getHeaderAsString(req.headers['x-forwarded-for']);
  if (xForwardedFor) {
    const firstIp = xForwardedFor.split(',')[0].trim();
    if (firstIp && firstIp !== '::1') return firstIp;
  }

  const proxyHeaders = ['x-real-ip', 'cf-connecting-ip', 'true-client-ip'];
  for (const header of proxyHeaders) {
    const ip = getHeaderAsString(req.headers[header]);
    if (ip && ip !== '::1') return ip;
  }

  const socketIp = req.socket?.remoteAddress;
  if (socketIp) {
    return socketIp.replace('::ffff:', '').replace('::1', '127.0.0.1');
  }

  const connectionIp = req.connection?.remoteAddress;
  if (connectionIp) {
    return connectionIp.replace('::ffff:', '').replace('::1', '127.0.0.1');
  }

  return 'unknown';
};

export const Logger: Middleware = (
  req: IRequest,
  res: IResponse,
  next: NextFunction
) => {
  const start = Date.now();

  const now = new Date().toLocaleString(undefined, {
    hour12: false,
  });

  const ip = getIP(req);

  res.on("finish", () => {
    const duration = Date.now() - start;
    const log = `[${now}] ${req.method} ${req.url} - Status: ${res.statusCode} - ${duration}ms - IP: ${ip}`;
    console.log(log);
  });

  next();
};
