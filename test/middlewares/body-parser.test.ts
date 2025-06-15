import { describe, it, expect, vi, beforeEach } from "vitest";
import * as registry from "../../src/parsers/registry";
import { BodyParser, IRequest, IResponse } from "../../src/middlewares";

describe("BodyParser Middleware", () => {
  beforeEach(() => {
    registry.getRegisteredParsers().length = 0;
  });

  const createMockReq = (chunks: Buffer[], headers: Record<string, string>) => {
    return {
      [Symbol.asyncIterator]: async function* () {
        for (const chunk of chunks) {
          yield chunk;
        }
      },
      headers
    } as unknown as IRequest;
  };

  it("should parse the body using a matching parser", async () => {
    const rawBody = '{"hello":"world"}';

    const mockParser = vi.fn((contentType, body) => {
      if (contentType.includes("application/json")) {
        return JSON.parse(body);
      }
    });

    registry.registerParser(mockParser);

    const req = createMockReq([Buffer.from(rawBody)], {
      "content-type": "application/json"
    });

    const res = {} as IResponse;
    const next = vi.fn();

    await BodyParser(req, res, next);

    expect((req as any).body).toEqual({ hello: "world" });
    expect(next).toHaveBeenCalledOnce();
  });

  it("should skip if no parser matches", async () => {
    const rawBody = "foo=bar";

    const mockParser = vi.fn(() => undefined);
    registry.registerParser(mockParser);

    const req = createMockReq([Buffer.from(rawBody)], {
      "content-type": "text/plain"
    });

    const res = {} as IResponse;
    const next = vi.fn();

    await BodyParser(req, res, next);

    expect((req as any).body).toBeUndefined();
    expect(next).toHaveBeenCalledOnce();
  });

  it("should handle empty body", async () => {
    const req = createMockReq([], { "content-type": "application/json" });

    const res = {} as IResponse;
    const next = vi.fn();

    await BodyParser(req, res, next);

    expect((req as any).body).toBeUndefined();
    expect(next).toHaveBeenCalledOnce();
  });
});