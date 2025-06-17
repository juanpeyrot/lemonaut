import { describe, it, expect, vi } from "vitest";
import { dispatchChain } from "../../src/utils";
import { IRequest, IResponse } from "../../src/types";

describe("dispatchChain", () => {
  const createMockReqRes = (): [IRequest, IResponse] => {
    const req = {} as IRequest;
    const res = {
      end: vi.fn(),
      setHeader: vi.fn(),
    } as unknown as IResponse;
    return [req, res];
  };

  it("should execute a single handler", async () => {
    const [req, res] = createMockReqRes();
    let called = false;

    const handler = async () => {
      called = true;
    };

    await dispatchChain(req, res, [handler]);
    expect(called).toBe(true);
  });

  it("should execute middleware that leads to another handler", async () => {
    const [req, res] = createMockReqRes();
    const calls: string[] = [];

    const mw = async (_req, _res, next) => {
      calls.push("one");
      await next();
    };
    const handler = async () => {
      calls.push("two");
    };

    await dispatchChain(req, res, [mw, handler]);
    expect(calls).toEqual(["one", "two"]);
  });

  it("should execute middleware and then handler", async () => {
    const [req, res] = createMockReqRes();
    const order: string[] = [];

    const mw = async (_req, _res, next) => {
      order.push("middleware");
      await next();
    };

    const handler = async () => {
      order.push("handler");
    };

    await dispatchChain(req, res, [mw, handler]);
    expect(order).toEqual(["middleware", "handler"]);
  });

  it("should stop if middleware does not call next", async () => {
    const [req, res] = createMockReqRes();
    const order: string[] = [];

    const mw = async () => {
      order.push("middleware");
    };

    const handler = async () => {
      order.push("handler");
    };

    await dispatchChain(req, res, [mw, handler]);
    expect(order).toEqual(["middleware"]);
  });

  it("should skip if handlers array is empty", async () => {
    const [req, res] = createMockReqRes();
    await dispatchChain(req, res, []);
    expect(res.end).not.toHaveBeenCalled();
  });
});
