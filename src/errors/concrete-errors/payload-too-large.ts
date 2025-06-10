import { HttpStatus } from "../../constants/http-status";
import { HttpError } from "../http-error";

export class PayloadTooLargeError extends HttpError {
  constructor(message = "Payload Too Large", details?: any) {
    super(message, HttpStatus.PAYLOAD_TOO_LARGE, details);
  }
}