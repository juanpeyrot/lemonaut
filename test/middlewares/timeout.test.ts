import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { timeout } from "../../src/middlewares";

describe("timeout middleware", () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;
  let endSpy: any;

  beforeEach(() => {
    mockReq = {};
    endSpy = vi.fn();
    mockRes = {
      writableEnded: false,
      statusCode: 200,
      headers: {},
      end: endSpy,
      setHeader: vi.fn(),
    };
    mockNext = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("should timeout if request takes too long", () => {
    const middleware = timeout(1000);
    middleware(mockReq, mockRes, mockNext);

    vi.advanceTimersByTime(1001);

    expect(endSpy).toHaveBeenCalledWith(
      JSON.stringify({ error: "Request timed out" }),
      undefined,
      undefined
    );
    expect(mockRes.statusCode).toBe(503);
    expect(mockRes.setHeader).toHaveBeenCalledWith(
      "Content-Type",
      "application/json"
    );
  });

  it("should not timeout if response ends first", () => {
    const middleware = timeout(1000);
    middleware(mockReq, mockRes, mockNext);

    mockRes.end("response data");
    vi.advanceTimersByTime(1001);

    expect(endSpy).toHaveBeenCalledWith("response data", undefined, undefined);
    expect(endSpy).not.toHaveBeenCalledWith(
      JSON.stringify({ error: "Request timed out" }),
      undefined,
      undefined
    );
  });

  it("should clear timeout when response ends", () => {
    const middleware = timeout(1000);
    middleware(mockReq, mockRes, mockNext);

    mockRes.end();
    vi.advanceTimersByTime(1001);

    expect(endSpy).not.toHaveBeenCalledWith(
      JSON.stringify({ error: "Request timed out" }),
      undefined,
      undefined
    );
  });

  it("should use default timeout of 10000ms when no value provided", () => {
    const middleware = timeout();
    middleware(mockReq, mockRes, mockNext);

    vi.advanceTimersByTime(9999);
    expect(endSpy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(2);
    expect(endSpy).toHaveBeenCalled();
  });
  it("should do nothing if response has already ended before timeout", () => {
    mockRes.writableEnded = true;

    const middleware = timeout(1000);
    middleware(mockReq, mockRes, mockNext);

    vi.advanceTimersByTime(1001);
    expect(endSpy).not.toHaveBeenCalled();
  });
  it("should respect different timeout limits", () => {
    const middleware = timeout(500);
    middleware(mockReq, mockRes, mockNext);

    vi.advanceTimersByTime(499);
    expect(endSpy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(2);
    expect(endSpy).toHaveBeenCalled();
  });

  it("should set Content-Type to application/json on timeout", () => {
    const middleware = timeout(1000);
    middleware(mockReq, mockRes, mockNext);

    vi.advanceTimersByTime(1001);
    expect(mockRes.setHeader).toHaveBeenCalledWith(
      "Content-Type",
      "application/json"
    );
  });
  it("calls originalEnd with chunk if chunk is a function", () => {
    const middleware = timeout(1000);
    middleware(mockReq, mockRes, mockNext);

    const func = vi.fn();
    (mockRes.end as any)(func);

    expect(endSpy).toHaveBeenCalledWith(func);
  });

  it("calls originalEnd with chunk and encoding if encoding is a function", () => {
    const middleware = timeout(1000);
    middleware(mockReq, mockRes, mockNext);

    const chunk = "data";
    const func = vi.fn();
    (mockRes.end as any)(chunk, func);

    expect(endSpy).toHaveBeenCalledWith(chunk, func);
  });
});
