import { HttpStatus } from "../../constants";
import { HttpError } from "../http-error";

export class BadGatewayError extends HttpError {
  constructor(message = "Bad Gateway", details?: any) {
    super(message, HttpStatus.BAD_GATEWAY, details);
  }
}