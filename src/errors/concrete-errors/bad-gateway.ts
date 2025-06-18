import { HttpStatus } from "../../constants/index.js";
import { HttpError } from "../http-error.js";

export class BadGatewayError extends HttpError {
  constructor(message = "Bad Gateway", details?: any) {
    super(message, HttpStatus.BAD_GATEWAY, details);
  }
}