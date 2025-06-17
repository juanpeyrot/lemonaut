import { describe, it, expect, vi } from "vitest";
import { JSONParser } from "../../src/parsers/json";
import * as registry from "../../src/parsers/registry";
import { IRequest, IResponse } from "../../src/types";

describe("JSONParserImpl", () => {
  const rawBody = '{"foo":"bar"}';

  JSONParser();
  const parsers = registry.getRegisteredParsers();
  const JSONParserImpl = parsers.find(fn =>
    fn("application/json", rawBody) !== undefined
  )!;

  it("should parse valid JSON", () => {
    const result = JSONParserImpl("application/json", rawBody);
    expect(result).toEqual({ foo: "bar" });
  });

  it("should return undefined for invalid JSON", () => {
    const result = JSONParserImpl("application/json", '{"foo":');
    expect(result).toBeUndefined();
  });

  it("should return undefined for non-JSON content-type", () => {
    const result = JSONParserImpl("text/plain", rawBody);
    expect(result).toBeUndefined();
  });
});

describe("JSONParser middleware", () => {
  it("should register the parser and call next()", () => {
    const spy = vi.spyOn(registry, "registerParser");
    const next = vi.fn();

    const middleware = JSONParser();
    middleware({} as IRequest, {} as IResponse, next);

    expect(spy).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});