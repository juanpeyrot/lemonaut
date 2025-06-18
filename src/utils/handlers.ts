import { Handler, Middleware, IRequest, IResponse } from "../types/index.js";
import { RouteHandler } from "../types/types.js";

export const dispatchChain = (
  request: IRequest,
  response: IResponse,
  handlers: RouteHandler[]
): Promise<void> => {
  return invokeHandlers(request, response, handlers, 0);
};

export const invokeHandlers = async (
  request: IRequest,
  response: IResponse,
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
