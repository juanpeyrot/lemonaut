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

  it("allows requests below the limit", () => {
    const middleware = rateLimit({ max: 2, windowMs: 1000 });

    middleware(req, res, next);
    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(res.end).not.toHaveBeenCalled();
  });

  it("blocks requests above the limit", () => {
    const middleware = rateLimit({ max: 1, windowMs: 1000 });

    middleware(req, res, next);
    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(429);
    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "application/json");
    expect(res.end).toHaveBeenCalledWith(JSON.stringify({ error: "Too many requests" }));
  });

	it("resets counter and clears old entries when window expires", () => {
  const middleware = rateLimit({ max: 2, windowMs: 1000 });

  const oldTime = Date.now() - 2000;
  ipMap.set("1.2.3.4", { count: 5, start: oldTime });

  const oldTime2 = Date.now() - 5000;
  ipMap.set("5.6.7.8", { count: 10, start: oldTime2 });

  middleware(req, res, next);

  expect(ipMap.has("5.6.7.8")).toBe(false);
  expect(ipMap.get("1.2.3.4")?.count).toBe(1);
  expect(next).toHaveBeenCalled();
});

it("uses default options when none are provided", () => {
  const middleware = rateLimit();

  middleware(req, res, next);

  expect(next).toHaveBeenCalled();
});

it("uses 'unknown' as IP if req.socket.remoteAddress is undefined", () => {
  const middleware = rateLimit({ max: 1, windowMs: 1000 });

  req.socket = {} as any;
  middleware(req, res, next);

  expect(next).toHaveBeenCalled();
  expect(ipMap.has("unknown")).toBe(true);
});
});