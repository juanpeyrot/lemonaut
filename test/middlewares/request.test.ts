import { describe, it, expect, vi } from "vitest";
import { Request, IRequest } from "../../src/middlewares/request";
import { ServerResponse } from "http";

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
});