import { HttpStatus } from "../../constants/index.js";
import { HttpError } from "../http-error.js";

export class PayloadTooLargeError extends HttpError {
  constructor(message = "Payload Too Large", details?: any) {
    super(message, HttpStatus.PAYLOAD_TOO_LARGE, details);
  }
}