import { describe, it, expect, vi } from "vitest";
import { CookieParser } from "../../src/middlewares";
import { IRequest, IResponse, NextFunction } from "../../src/types";

describe("CookieParser middleware", () => {
  const createMockReq = (cookieHeader?: string): IRequest => {
    return {
      headers: cookieHeader ? { cookie: cookieHeader } : {},
    } as IRequest;
  };

  it("should parse multiple cookies", () => {
    const req = createMockReq("session=abc123; user=John%20Doe");
    const res = {} as IResponse;
    const next = vi.fn() as NextFunction;

    const middleware = CookieParser();
    middleware(req, res, next);

    expect(req.cookies).toEqual({
      session: "abc123",
      user: "John Doe",
    });

    expect(next).toHaveBeenCalledOnce();
  });

  it("should handle no cookies", () => {
    const req = createMockReq();
    const res = {} as IResponse;
    const next = vi.fn() as NextFunction;

    const middleware = CookieParser();
    middleware(req, res, next);

    expect(req.cookies).toEqual({});
    expect(next).toHaveBeenCalledOnce();
  });

  it("should handle cookies with = in value", () => {
    const req = createMockReq("token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
    const res = {} as IResponse;
    const next = vi.fn() as NextFunction;

    const middleware = CookieParser();
    middleware(req, res, next);

    expect(req.cookies).toEqual({
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
    });

    expect(next).toHaveBeenCalledOnce();
  });
});