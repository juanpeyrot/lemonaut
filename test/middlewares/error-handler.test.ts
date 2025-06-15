import { describe, it, expect, vi } from "vitest";
import { HttpError } from "../../src/errors";
import { ErrorHandler, IRequest, IResponse } from "../../src/middlewares";

const createMockRes = () => {
  const res = {
    statusCode: 0,
    setHeader: vi.fn(),
    end: vi.fn(),
  } as unknown as IResponse;
  return res;
};

describe("ErrorHandler middleware", () => {
  it("should handle generic Error", async () => {
    const req = {} as IRequest;
    const res = createMockRes();
    const next = vi.fn().mockRejectedValue(new Error("Something went wrong"));

    await ErrorHandler(req, res, next);

    expect(res.statusCode).toBe(500);
    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "application/json");
    expect(res.end).toHaveBeenCalledWith(
      JSON.stringify({ error: "Something went wrong" })
    );
  });

  it("should handle HttpError with custom status", async () => {
    const req = {} as IRequest;
    const res = createMockRes();
    const next = vi.fn().mockRejectedValue(new HttpError("Not Found", 404));

    await ErrorHandler(req, res, next);

    expect(res.statusCode).toBe(404);
    expect(res.end).toHaveBeenCalledWith(JSON.stringify({ error: "Not Found" }));
  });

  it("should handle unknown thrown value", async () => {
    const req = {} as IRequest;
    const res = createMockRes();
    const next = vi.fn().mockImplementation(() => {
      throw "string error";
    });

    await ErrorHandler(req, res, next);

    expect(res.statusCode).toBe(500);
    expect(res.end).toHaveBeenCalledWith(
      JSON.stringify({ error: "Internal Server Error" })
    );
  });

  it("should call next with no error", async () => {
    const req = {} as IRequest;
    const res = createMockRes();
    const next = vi.fn().mockResolvedValue(undefined);

    await ErrorHandler(req, res, next);

    expect(res.end).not.toHaveBeenCalled();
  });
});