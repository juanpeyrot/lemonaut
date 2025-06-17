import { describe, it, expect, vi } from "vitest";
import { Request } from "../../src/middlewares/request";
import { ServerResponse } from "http";
import { IRequest } from "../../src/types";

describe("Request middleware", () => {
  it("should extract route params and query params", () => {
    const routes = new Set([
      "/users/:id/GET",
      "/posts/:postId/comments/:commentId/GET",
    ]).values();

    const req = {
      method: "GET",
      url: "/users/123?sort=asc&limit=10",
    } as IRequest;

    const res = {} as ServerResponse;
    const next = vi.fn();

    Request(routes, req, res, next);

    expect(req.params).toEqual({ id: "123" });
    expect(req.query).toEqual({ sort: "asc", limit: "10" });
    expect(next).toHaveBeenCalledOnce();
  });

  it("should fallback to empty params if no match", () => {
    const routes = new Set(["/products/:id/POST"]).values();

    const req = {
      method: "GET",
      url: "/products/123?active=true",
    } as IRequest;

    const res = {} as ServerResponse;
    const next = vi.fn();

    Request(routes, req, res, next);

    expect(req.params).toBeUndefined();
    expect(req.query).toEqual({ active: "true" });
    expect(next).toHaveBeenCalledOnce();
  });

  it("should parse pathname correctly from url with query", () => {
    const req = {
      url: "/foo/bar?x=1&y=2",
      method: "GET",
    } as any;
    const res = {} as any;

    const routes = ["/foo/bar/GET"];

    let nextCalled = false;
    Request(routes[Symbol.iterator](), req, res, () => {
      nextCalled = true;
    });

    expect(req.params).toBeDefined();
    expect(req.query).toEqual({ x: "1", y: "2" });
    expect(nextCalled).toBe(true);
  });

  it("should use '/' as pathname if url is undefined", () => {
    const req = {
      method: "GET",
      url: undefined,
    } as IRequest;

    const res = {} as any;

    let nextCalled = false;

    const routes = ["/GET"];

    Request(routes[Symbol.iterator](), req, res, () => {
      nextCalled = true;
    });

    expect(req.query).toEqual({});
    expect(nextCalled).toBe(true);
  });
});