import { HttpStatus } from "../../constants/index.js";
import { HttpError } from "../http-error.js";

export class ServiceUnavailableError extends HttpError {
  constructor(message = "Service Unavailable", details?: any) {
    super(message, HttpStatus.SERVICE_UNAVAILABLE, details);
  }
}