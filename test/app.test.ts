import { describe, it, expect, beforeAll, afterAll } from "vitest";
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
});