import { describe, it, expect } from "vitest";
import type { RouteHandler } from "../../src/types";
import { matchUrl } from "../../src/utils";

describe("matchUrl", () => {
  const dummyHandler: RouteHandler = (req, res) => res.end("ok");

  it("should match static route", () => {
    const routes = new Map<string, RouteHandler[]>([
      ["/hello/GET", [dummyHandler]],
    ]);

    const result = matchUrl("/hello/GET", routes);
    expect(result).toBe("/hello/GET");
  });

  it("should match dynamic route", () => {
    const routes = new Map<string, RouteHandler[]>([
      ["/user/:id/GET", [dummyHandler]],
    ]);

    const result = matchUrl("/user/42/GET", routes);
    expect(result).toBe("/user/:id/GET");
  });

  it("should return false if no match is found", () => {
    const routes = new Map<string, RouteHandler[]>([
      ["/about/GET", [dummyHandler]],
    ]);

    const result = matchUrl("/contact/GET", routes);
    expect(result).toBe(false);
  });

  it("should match route with multiple params", () => {
    const routes = new Map<string, RouteHandler[]>([
      ["/user/:userId/post/:postId/GET", [dummyHandler]],
    ]);

    const result = matchUrl("/user/5/post/99/GET", routes);
    expect(result).toBe("/user/:userId/post/:postId/GET");
  });

  it("should decode URI components in params", () => {
    const routes = new Map<string, RouteHandler[]>([
      ["/search/:term/GET", [dummyHandler]],
    ]);

    const result = matchUrl("/search/%C3%A9xito/GET", routes);
    expect(result).toBe("/search/:term/GET");
  });
});