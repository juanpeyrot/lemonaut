import { describe, it, expect } from "vitest";
import { joinPaths } from "../../src/utils";

describe("joinPaths", () => {
  it("should join simple segments", () => {
    expect(joinPaths("users", "123")).toBe("users/123");
  });

  it("should remove leading and trailing slashes", () => {
    expect(joinPaths("/users/", "/123/")).toBe("/users/123");
  });

  it("should ignore empty segments", () => {
    expect(joinPaths("", "users", "", "123")).toBe("/users/123");
  });

  it("should return just root for all empty segments", () => {
    expect(joinPaths("", "", "")).toBe("/");
  });

  it("should handle single segment with leading/trailing slashes", () => {
    expect(joinPaths("/test/")).toBe("/test");
  });

  it("should handle already clean input", () => {
    expect(joinPaths("a", "b", "c")).toBe("a/b/c");
  });
});