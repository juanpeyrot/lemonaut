import { describe, it, expect, vi, beforeEach } from "vitest";
import { URLEncodedParser } from "../../src/parsers/urlEncoded";
import * as registry from "../../src/parsers/registry";

describe("URLEncodedParser", () => {
  const rawBody = "foo=bar&num=42";

  beforeEach(() => {
    registry.getRegisteredParsers().length = 0;
  });

  it("should register and resolve the urlencoded parser", () => {
    URLEncodedParser();

    const parsers = registry.getRegisteredParsers();

    const parser = parsers.find(fn =>
      fn("application/x-www-form-urlencoded", rawBody) !== undefined
    )!;

    const result = parser("application/x-www-form-urlencoded", rawBody);

    expect(result).toEqual({ foo: "bar", num: "42" });
  });

  it("should ignore incorrect content-type", () => {
    URLEncodedParser();

    const parsers = registry.getRegisteredParsers();

    const parser = parsers.find(fn =>
      fn("text/plain", rawBody) !== undefined
    );

    expect(parser).toBeUndefined();
  });

  it("should call next in the middleware", () => {
    const next = vi.fn();
    const middleware = URLEncodedParser();
    middleware({} as any, {} as any, next);
    expect(next).toHaveBeenCalledOnce();
  });
});