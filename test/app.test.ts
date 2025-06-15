import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { lemonaut } from "../src/app";
import { makeFetch } from "supertest-fetch";
import fs from "fs";
import path from "path";
import { Router } from "../src/router";

describe("Lemonaut App", () => {
  let app: ReturnType<typeof lemonaut>;
  let fetch: ReturnType<typeof makeFetch>;
  let server: ReturnType<ReturnType<typeof lemonaut>["startMission"]>;

  beforeAll(() => {
    app = lemonaut();
    app.get("/hello", (_, res) => res.end("Hello!"));
    server = app.startMission(0);
    fetch = makeFetch(server);
  });

  afterAll(() => {
    server.close();
  });

  it("responds to GET requests", async () => {
    const res = await fetch("/hello");
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toBe("Hello!");
  });

  it("returns 404 for unknown routes", async () => {
    const res = await fetch("/not-found");
    expect(res.status).toBe(404);
  });

  it("uses router under a base path", async () => {
    const nestedRouter = Router();
    nestedRouter.get("/ping", (_, res) => res.end("pong"));

    app.useRouter("/api", nestedRouter);
    const res = await fetch("/api/ping");
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("pong");
  });

  it("serves static files", async () => {
    const testFilePath = path.join(process.cwd(), "testFile.txt");
    fs.writeFileSync(testFilePath, "Static Content");

    await app.serveStatic(".");
    const res = await fetch("/testFile.txt");
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Static Content");

    fs.unlinkSync(testFilePath);
  });

  it("returns 404 if request url or method is missing", async () => {
    const server = app.startMission(0);
    const res = await makeFetch(server)("", { method: undefined });
    expect(res.status).toBe(404);
    server.close();
  });

  it("normalizes url path correctly", async () => {
    app.get("/normalize/test", (_, res) => res.end("Normalized"));

    const server = app.startMission(0);
    const fetch = makeFetch(server);

    const res = await fetch("///normalize//test//", { method: "GET" });
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Normalized");

    server.close();
  });

  it("does not send 404 if response already ended", async () => {
    app.get("/early-end", (req, res) => {
      res.end("Early End");
    });

    const server = app.startMission(0);
    const fetch = makeFetch(server);

    const res = await fetch("/early-end");
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Early End");

    server.close();
  });

  it("concatenates handlers when using useRouter on existing routes", async () => {
    const router1 = Router();
    router1.get("/concat", (_, res) => res.end("First"));

    const router2 = Router();
    router2.get("/concat", (_, res) => res.end("Second"));

    app.useRouter("/base", router1);
    app.useRouter("/base", router2);

    const server = app.startMission(0);
    const fetch = makeFetch(server);

    const res = await fetch("/base/concat");
    expect(res.status).toBe(200);
    expect(await res.text()).toMatch(/First|Second/);

    server.close();
  });

  it("executes global middlewares in order", async () => {
    const calls: string[] = [];

    app.useMany(
      (req, res, next) => {
        calls.push("mw1");
        next();
      },
      (req, res, next) => {
        calls.push("mw2");
        next();
      }
    );

    app.get("/mw-order", (req, res) => {
      calls.push("handler");
      res.end("done");
    });

    const server = app.startMission(0);
    const fetch = makeFetch(server);

    const res = await fetch("/mw-order");
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("done");
    expect(calls).toEqual(["mw1", "mw2", "handler"]);

    server.close();
  });

  it("serves nested static files", async () => {
    const folder = path.join(process.cwd(), "static-test");
    const nestedFolder = path.join(folder, "nested");
    fs.mkdirSync(nestedFolder, { recursive: true });

    const filePath = path.join(nestedFolder, "file.txt");
    fs.writeFileSync(filePath, "Nested Content");

    await app.serveStatic(folder);

    const server = app.startMission(0);
    const fetch = makeFetch(server);

    const res = await fetch("/nested/file.txt");
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Nested Content");

    fs.rmSync(folder, { recursive: true, force: true });
    server.close();
  });

  it("responds with 304 Not Modified if ETag matches", async () => {
    const folder = path.join(process.cwd(), "etag-test");
    fs.mkdirSync(folder, { recursive: true });

    const filePath = path.join(folder, "file.txt");
    fs.writeFileSync(filePath, "ETag Test");

    await app.serveStatic(folder);

    const server = app.startMission(0);
    const fetch = makeFetch(server);

    const res1 = await fetch("/file.txt");
    expect(res1.status).toBe(200);
    const etag = res1.headers.get("etag");
    expect(etag).toBeTruthy();

    const res2 = await fetch("/file.txt", {
      headers: {
        "If-None-Match": etag || "",
      },
    });

    expect(res2.status).toBe(304);
    server.close();
  });

  it("starts server on dynamic port", async () => {
    const localApp = lemonaut();
    localApp.get("/dynamic", (_, res) => res.end("dynamic port"));

    const server = localApp.startMission(0);
    const port = (server.address() as any)?.port;
    expect(port).toBeGreaterThan(0);

    const fetch = makeFetch(server);
    const res = await fetch("/dynamic");
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("dynamic port");

    server.close();
  });

  it("useRouter with empty router does nothing", async () => {
    const emptyRouter = Router();
    app.useRouter("/empty", emptyRouter);

    const server = app.startMission(0);
    const fetch = makeFetch(server);

    const res = await fetch("/empty/anything");
    expect(res.status).toBe(404);

    server.close();
  });

  it("should respond 404 if fs.statSync throws error", async () => {
    const testFile = "test-file.txt";
    fs.writeFileSync(testFile, "content");

    const statSyncSpy = vi.spyOn(fs, "statSync").mockImplementation(() => {
      throw new Error("Stat error");
    });

    await app.serveStatic(".");

    const server = app.startMission(0);
    const fetch = makeFetch(server);

    const res = await fetch(`/${testFile}`);
    expect(res.status).toBe(404);
    expect(await res.text()).toBe("Not Found");

    statSyncSpy.mockRestore();
    fs.unlinkSync(testFile);
    server.close();
  });
});
