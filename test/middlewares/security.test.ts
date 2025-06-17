import { describe, it, expect, vi } from "vitest";
import { IncomingMessage } from "http";
import { IResponse } from "../../src/types";
import { Security } from "../../src/middlewares";

describe("security middleware", () => {
  it("sets security headers and calls next", () => {
    const req = {} as IncomingMessage;

    const setHeader = vi.fn();
    const res = {
      setHeader,
    } as unknown as IResponse;

    const next = vi.fn();

    Security(req, res, next);

    expect(setHeader).toHaveBeenCalledWith("X-DNS-Prefetch-Control", "off");
    expect(setHeader).toHaveBeenCalledWith("X-Frame-Options", "DENY");
    expect(setHeader).toHaveBeenCalledWith("X-Content-Type-Options", "nosniff");
    expect(setHeader).toHaveBeenCalledWith("Referrer-Policy", "no-referrer");
    expect(setHeader).toHaveBeenCalledWith("Content-Security-Policy", "default-src 'self'");

    expect(setHeader).toHaveBeenCalledTimes(5);
    expect(next).toHaveBeenCalledOnce();
  });
});