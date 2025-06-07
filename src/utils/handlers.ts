import { DecoratedRequest } from "../request";
import { DecoratedResponse } from "../response";
import { Handler, Middleware, RouteHandler } from "../types";

export const dispatchChain = (
  request: DecoratedRequest,
  response: DecoratedResponse,
  handlers: RouteHandler[]
): Promise<void> => {
  return invokeHandlers(request, response, handlers, 0);
};

export const invokeHandlers = async (
  request: DecoratedRequest,
  response: DecoratedResponse,
  handlers: RouteHandler[],
  index: number
): Promise<void> => {
  if (index >= handlers.length) return;

  const current = handlers[index];

  if (current.length === 3) {
    const middleware = current as Middleware;
    await middleware(request, response, () =>
      invokeHandlers(request, response, handlers, index + 1)
    );
  } else {
    const handler = current as Handler;
    await handler(request, response);
  }
};
