import { describe, it, beforeEach, expect, vi } from "vitest";
import { IncomingMessage } from "http";
import { Response  } from "../../src/middlewares/response";
import path from "path";
import ejs from "ejs";
import { IResponse } from "../../src/types";

vi.mock("ejs", () => ({
  default: {
    renderFile: vi.fn().mockResolvedValue("<html>Rendered</html>"),
  },
}));

describe("Response middleware", () => {
  let req: IncomingMessage;
  let res: IResponse;
  let next: () => void;

  beforeEach(() => {
    req = {} as IncomingMessage;

    const fakeRes = {
      setHeader: vi.fn(),
      end: vi.fn(),
      statusCode: 200,
    };

    Object.defineProperty(fakeRes, "writableEnded", {
      value: false,
      writable: true,
      configurable: true,
    });

    res = fakeRes as unknown as IResponse;

    next = vi.fn();
  });

  it("should extend ServerResponse with custom methods", async () => {
    Response(req, res, next);

    expect(typeof res.status).toBe("function");
    expect(typeof res.json).toBe("function");
    expect(typeof res.send).toBe("function");
    expect(typeof res.render).toBe("function");

    expect(next).toHaveBeenCalledOnce();
  });

  it("status() should set the statusCode", () => {
    Response(req, res, next);
    res.status(404);
    expect(res.statusCode).toBe(404);
  });

  it("json() should send a JSON response", () => {
    Response(req, res, next);
    res.json({ message: "ok" });
    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "application/json");
    expect(res.end).toHaveBeenCalledWith(JSON.stringify({ message: "ok" }));
  });

  it("json() should do nothing if response already ended", () => {
    Object.defineProperty(res, "writableEnded", { value: true });
    Response(req, res, next);
    res.json({ ignored: true });
    expect(res.setHeader).not.toHaveBeenCalled();
    expect(res.end).not.toHaveBeenCalled();
  });

  it("send() should send raw data", async () => {
    Response(req, res, next);
    await res.send("Hello");
    expect(res.end).toHaveBeenCalledWith("Hello");
  });

  it("send() should do nothing if response already ended", async () => {
    Object.defineProperty(res, "writableEnded", { value: true });
    Response(req, res, next);
    await res.send("Ignored");
    expect(res.end).not.toHaveBeenCalled();
  });

  it("render() should render and send HTML content", async () => {
    Response(req, res, next);
    await res.render("index.ejs", { name: "John" });
    expect(ejs.renderFile).toHaveBeenCalledWith(
      path.join(process.cwd(), "views", "index.ejs"),
      { name: "John" },
      { async: true }
    );
    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "text/html");
    expect(res.end).toHaveBeenCalledWith("<html>Rendered</html>");
  });

  it("render() should handle render error gracefully", async () => {
    vi.mocked(ejs.renderFile).mockRejectedValueOnce(new Error("Render fail"));

    Response(req, res, next);
    await res.render("error.ejs", {});
    expect(res.statusCode).toBe(500);
    expect(res.end).toHaveBeenCalledWith("Template rendering error");
  });

  it("render() should do nothing if response already ended", async () => {
    Object.defineProperty(res, "writableEnded", { value: true });
    Response(req, res, next);
    await res.render("ignored.ejs", {});
    expect(res.end).not.toHaveBeenCalled();
  });
});