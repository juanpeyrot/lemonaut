import { HttpStatus } from "../../constants/index.js";
import { HttpError } from "../http-error.js";

export class GatewayTimeoutError extends HttpError {
  constructor(message = "Gateway Timeout", details?: any) {
    super(message, HttpStatus.GATEWAY_TIMEOUT, details);
  }
}