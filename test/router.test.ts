import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { lemonaut } from "../src/app";
import { Router } from "../src/router";
import { makeFetch } from "supertest-fetch";

describe("Router", () => {
  let app: ReturnType<typeof lemonaut>;
  let fetch: ReturnType<typeof makeFetch>;
  let server: ReturnType<ReturnType<typeof lemonaut>["startMission"]>;

  beforeAll(() => {
    app = lemonaut();

    app.get("/hello", (_req, res) => res.send("Hello World"));
    app.get("/user/:id", (req, res) => res.json({ user: req.params?.id }));

    app.post("/post", (_req, res) => res.send("Created"));
    app.put("/put", (_req, res) => res.send("Updated"));
    app.patch("/patch", (_req, res) => res.send("Patched"));
    app.delete("/delete", (_req, res) => res.send("Deleted"));

    app.use((_req, res, next) => {
      res.setHeader("x-powered-by", "lemonaut");
      next();
    });

    app.use("/secure", (req, res, next) => {
      if (req.headers["authorization"] === "secret") return next();
      res.statusCode = 401;
      res.end("Unauthorized");
    });

    app.get("/secure", (_req, res) => res.end("Authorized"));

    const nested = Router();
    nested.get("/nested", (_req, res) => res.end("Nested route"));
    app.use("/api", nested);

    const midRouter = Router();
    midRouter.get("/mix", (_req, res) => res.end("Mixed"));

    app.use(
      "/mixed",
      (req, res, next) => {
        res.setHeader("x-custom", "middleware");
        next();
      },
      midRouter
    );

    server = app.startMission(0);
    fetch = makeFetch(server);
  });

  afterAll(() => {
    server.close();
  });

  it("should handle GET route", async () => {
    const res = await fetch("/hello");
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Hello World");
  });

  it("should handle dynamic routes", async () => {
    const res = await fetch("/user/42");
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json).toEqual({ user: "42" });
  });

  it("should handle POST", async () => {
    const res = await fetch("/post", { method: "POST" });
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Created");
  });

  it("should handle PUT", async () => {
    const res = await fetch("/put", { method: "PUT" });
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Updated");
  });

  it("should handle PATCH", async () => {
    const res = await fetch("/patch", { method: "PATCH" });
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Patched");
  });

  it("should handle DELETE", async () => {
    const res = await fetch("/delete", { method: "DELETE" });
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Deleted");
  });

  it("should apply global middleware", async () => {
    const res = await fetch("/delete", { method: "DELETE" });
    expect(res.headers.get("x-powered-by")).toBe("lemonaut");
  });

  it("should apply route-specific middleware and deny access", async () => {
    const res = await fetch("/secure");
    expect(res.status).toBe(401);
    expect(await res.text()).toBe("Unauthorized");
  });

  it("should allow access with correct middleware", async () => {
    const res = await fetch("/secure", {
      headers: { Authorization: "secret" },
    });
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Authorized");
  });

  it("should handle nested router", async () => {
    const res = await fetch("/api/nested");
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Nested route");
  });

  it("should handle mixed middleware and router", async () => {
    const res = await fetch("/mixed/mix");
    expect(res.status).toBe(200);
    expect(res.headers.get("x-custom")).toBe("middleware");
    expect(await res.text()).toBe("Mixed");
  });

  it("should allow useMany to apply global middleware", async () => {
    const r = Router();
    let called = false;

    r.useMany((_req, _res, next) => {
      called = true;
      next();
    });

    r.get("/test", (_req, res) => res.end("test"));

    const app = lemonaut();
    app.use("/hook", r);
    const server = app.startMission(0);
    const fetch = makeFetch(server);

    const res = await fetch("/hook/test");
    expect(called).toBe(true);
    expect(await res.text()).toBe("test");

    server.close();
  });

  it("should handle child router without matchable routes", async () => {
    const badRouter = Router();

    const routes = badRouter.getRoutes();
    routes.set("/invalid-key", [(req, res) => res.end("bad")]);

    const app = lemonaut();
    app.use("/fail", badRouter);

    const server = app.startMission(0);
    const fetch = makeFetch(server);

    const res = await fetch("/fail/invalid-key");
    expect(res.status).toBe(404);

    server.close();
  });

  it("should prepend middleware to existing route", async () => {
    const r = Router();
    const calls: string[] = [];

    r.get("/order", (_req, res) => {
      calls.push("handler");
      res.end("done");
    });

    r.use("/order", (req, res, next) => {
      calls.push("middleware");
      next();
    });

    const app = lemonaut();
    app.use("/test", r);

    const server = app.startMission(0);
    const fetch = makeFetch(server);

    const res = await fetch("/test/order");
    expect(calls).toEqual(["middleware", "handler"]);
    expect(await res.text()).toBe("done");

    server.close();
  });

  it("should support use() with only middleware (no path)", async () => {
    const r = Router();
    const log: string[] = [];

    r.use((_req, _res, next) => {
      log.push("global-mw");
      next();
    });

    r.get("/simple", (_req, res) => {
      log.push("handler");
      res.end("ok");
    });

    const app = lemonaut();
    app.use("/path", r);

    const server = app.startMission(0);
    const fetch = makeFetch(server);

    const res = await fetch("/path/simple");
    expect(res.status).toBe(200);
    expect(log).toEqual(["global-mw", "handler"]);

    server.close();
  });

  it("should apply global middlewares from a nested router via use()", async () => {
    const child = Router();
    const logs: string[] = [];

    child.useMany((_req, _res, next) => {
      logs.push("child-middleware");
      next();
    });

    child.get("/sub", (_req, res) => {
      logs.push("child-handler");
      res.end("done");
    });

    const parent = Router();
    parent.use("/api", child);

    const app = lemonaut();
    app.use("/", parent);

    const server = app.startMission(0);
    const fetch = makeFetch(server);

    const res = await fetch("/api/sub");
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("done");
    expect(logs).toEqual(["child-middleware", "child-handler"]);

    server.close();
  });
});
