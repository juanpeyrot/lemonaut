import { describe, it, expect, vi } from "vitest";
import { CORS } from "../../src/middlewares/cors";
import { IRequest, IResponse } from "../../src/types";

const createMockReqRes = (headers = {}, method = "GET") => {
  const req = {
    headers,
    method,
  } as IRequest;

  const headersSent: Record<string, string> = {};
  const res = {
    setHeader: (key: string, val: string) => {
      headersSent[key] = val;
    },
    end: vi.fn(),
    statusCode: 0,
  } as unknown as IResponse;

  return { req, res, headersSent };
};

describe("CORS middleware", () => {
  it("should apply default headers", () => {
    const { req, res, headersSent } = createMockReqRes();
    const next = vi.fn();

    const cors = CORS();
    cors(req, res, next);

    expect(headersSent["Access-Control-Allow-Origin"]).toBe("*");
    expect(headersSent["Access-Control-Allow-Methods"]).toBe(
      "GET,POST,PUT,PATCH,DELETE,OPTIONS"
    );
    expect(headersSent["Access-Control-Allow-Headers"]).toBe(
      "Content-Type,Authorization"
    );
    expect(headersSent["Access-Control-Allow-Credentials"]).toBeUndefined();
    expect(next).toHaveBeenCalledOnce();
  });

  it("should allow specific origin from list", () => {
    const { req, res, headersSent } = createMockReqRes(
      { origin: "https://myapp.com" },
      "GET"
    );
    const next = vi.fn();

    const cors = CORS({ origin: ["https://myapp.com", "https://other.com"] });
    cors(req, res, next);

    expect(headersSent["Access-Control-Allow-Origin"]).toBe("https://myapp.com");
    expect(next).toHaveBeenCalledOnce();
  });

  it("should not allow origin not in list", () => {
    const { req, res, headersSent } = createMockReqRes(
      { origin: "https://unauthorized.com" },
      "GET"
    );
    const next = vi.fn();

    const cors = CORS({ origin: ["https://allowed.com"] });
    cors(req, res, next);

    expect(headersSent["Access-Control-Allow-Origin"]).toBe("*");
    expect(next).toHaveBeenCalledOnce();
  });

  it("should respond to OPTIONS request", () => {
    const { req, res, headersSent } = createMockReqRes({}, "OPTIONS");
    const next = vi.fn();

    const cors = CORS({ credentials: true });
    cors(req, res, next);

    expect(res.statusCode).toBe(204);
    expect(res.end).toHaveBeenCalledOnce();
    expect(headersSent["Access-Control-Allow-Credentials"]).toBe("true");
    expect(next).not.toHaveBeenCalled();
  });

  it("should use custom methods and headers", () => {
    const { req, res, headersSent } = createMockReqRes({}, "GET");
    const next = vi.fn();

    const cors = CORS({
      methods: ["GET", "POST"],
      headers: ["X-Custom-Header"],
    });

    cors(req, res, next);

    expect(headersSent["Access-Control-Allow-Methods"]).toBe("GET,POST");
    expect(headersSent["Access-Control-Allow-Headers"]).toBe("X-Custom-Header");
    expect(next).toHaveBeenCalledOnce();
  });
});