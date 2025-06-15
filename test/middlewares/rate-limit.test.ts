import { describe, it, expect, vi, beforeEach } from "vitest";
import { IncomingMessage } from "http";
import { ipMap, IResponse, rateLimit } from "../../src/middlewares";

describe("rateLimit middleware", () => {
  let req: IncomingMessage;
  let res: IResponse;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
		ipMap.clear();

    req = new IncomingMessage(null as any);
    req.socket = { remoteAddress: "1.2.3.4" } as any;

    res = {
      statusCode: 200,
      setHeader: vi.fn(),
      end: vi.fn(),
    } as unknown as IResponse;

    next = vi.fn();
  });

  it("permite peticiones bajo el límite", () => {
    const middleware = rateLimit({ max: 2, windowMs: 1000 });

    middleware(req, res, next);
    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(res.end).not.toHaveBeenCalled();
  });

  it("bloquea peticiones por encima del límite", () => {
    const middleware = rateLimit({ max: 1, windowMs: 1000 });

    middleware(req, res, next);
    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(429);
    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "application/json");
    expect(res.end).toHaveBeenCalledWith(JSON.stringify({ error: "Too many requests" }));
  });
});