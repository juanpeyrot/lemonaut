import { describe, it, expect } from "vitest";
import { lemonaut } from "../src/app";

describe("App", () => {
  it("should create an app instance", () => {
    const app = lemonaut();
    expect(app).toBeDefined();
    expect(typeof app.startMission).toBe("function");
  });
});
