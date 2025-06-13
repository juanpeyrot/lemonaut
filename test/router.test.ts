import { describe, it, expect } from "vitest";
import { lemonaut } from "../src/app";
import { makeFetch } from "supertest-fetch";

describe("Router", () => {
  it("should handle GET route", async () => {
    const app = lemonaut();
    app.get("/hello", (_req, res) => res.send("Hello World"));

    const server = () => app.startMission(0);
		
    const fetch = makeFetch(server());

    const res = await fetch("/hello").expect(200);
    const text = await res.text();

    expect(text).toBe("Hello World");
  });

  it("should handle dynamic routes", async () => {
    const app = lemonaut();
    app.get("/user/:id", (req, res) => res.json({ user: req.params?.id }));

    const server = () => app.startMission(0);
    const fetch = makeFetch(server());

    const res = await fetch("/user/42").expect(200);
    const json = await res.json();

    expect(json).toEqual({ user: "42" });
  });
});