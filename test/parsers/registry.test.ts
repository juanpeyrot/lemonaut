import { describe, it, expect, beforeEach } from "vitest";
import { registerParser, getRegisteredParsers } from "../../src/parsers/registry";
import type { Parser } from "../../src/types";

describe("Parser Registry", () => {
  beforeEach(() => {
    const parsers = getRegisteredParsers();
    parsers.length = 0;
  });

  it("should register a parser", () => {
    const mockParser: Parser = () => ({});
    registerParser(mockParser);

    const parsers = getRegisteredParsers();
    expect(parsers).toContain(mockParser);
  });

  it("should return multiple registered parsers in order", () => {
    const parser1: Parser = () => ({ foo: "bar" });
    const parser2: Parser = () => ({ baz: "qux" });

    registerParser(parser1);
    registerParser(parser2);

    const parsers = getRegisteredParsers();
    expect(parsers).toEqual([parser1, parser2]);
  });

  it("should share state across calls (singleton behavior)", () => {
    const parser: Parser = () => ({ a: 1 });
    registerParser(parser);

    const parsersA = getRegisteredParsers();
    const parsersB = getRegisteredParsers();

    expect(parsersA).toBe(parsersB);
    expect(parsersB).toContain(parser);
  });
});