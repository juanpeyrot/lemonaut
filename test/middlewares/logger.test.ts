import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Logger } from "../../src/middlewares/logger";
import { EventEmitter } from "events";
import { IRequest, IResponse } from "../../src/types";

const createMockReq = (overrides = {}): IRequest =>
  ({
    method: "GET",
    url: "/test",
    headers: {},
    socket: { remoteAddress: "127.0.0.1" },
    connection: {},
    ...overrides,
  } as unknown as IRequest);

const createMockRes = (): IResponse & EventEmitter => {
  const emitter = new EventEmitter();
  return Object.assign(emitter, {
    statusCode: 200,
    setHeader: vi.fn(),
    end: vi.fn(),
  }) as unknown as IResponse & EventEmitter;
};

describe("Logger middleware", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it("logs info on finish event", () => {
    const req = createMockReq();
    const res = createMockRes();
    const next = vi.fn();

    Logger(req, res, next);
    res.emit("finish");

    expect(next).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledOnce();
    expect(logSpy.mock.calls[0][0]).toContain("GET /test");
    expect(logSpy.mock.calls[0][0]).toContain("Status: 200");
    expect(logSpy.mock.calls[0][0]).toContain("IP: 127.0.0.1");
  });

  it("extracts IP from x-forwarded-for header", () => {
    const req = createMockReq({
      headers: { "x-forwarded-for": "192.168.0.99, proxy" },
    });
    const res = createMockRes();
    const next = vi.fn();

    Logger(req, res, next);
    res.emit("finish");

    expect(logSpy.mock.calls[0][0]).toContain("IP: 192.168.0.99");
  });

  it("falls back to x-real-ip header", () => {
    const req = createMockReq({
      headers: { "x-real-ip": "10.10.10.10" },
    });
    const res = createMockRes();
    const next = vi.fn();

    Logger(req, res, next);
    res.emit("finish");

    expect(logSpy.mock.calls[0][0]).toContain("IP: 10.10.10.10");
  });

  it("cleans up ::ffff: from IP", () => {
    const req = createMockReq({
      socket: { remoteAddress: "::ffff:172.16.0.1" },
    });
    const res = createMockRes();
    const next = vi.fn();

    Logger(req, res, next);
    res.emit("finish");

    expect(logSpy.mock.calls[0][0]).toContain("IP: 172.16.0.1");
  });

  it("uses connection.remoteAddress if needed", () => {
    const req = createMockReq({
      socket: {},
      connection: { remoteAddress: "::ffff:8.8.8.8" },
    });
    const res = createMockRes();
    const next = vi.fn();

    Logger(req, res, next);
    res.emit("finish");

    expect(logSpy.mock.calls[0][0]).toContain("IP: 8.8.8.8");
  });
});