import { HttpStatus } from "../../constants";
import { HttpError } from "../http-error";

export class GatewayTimeoutError extends HttpError {
  constructor(message = "Gateway Timeout", details?: any) {
    super(message, HttpStatus.GATEWAY_TIMEOUT, details);
  }
}