import { HttpStatus } from "../../constants";
import { HttpError } from "../http-error";

export class ServiceUnavailableError extends HttpError {
  constructor(message = "Service Unavailable", details?: any) {
    super(message, HttpStatus.SERVICE_UNAVAILABLE, details);
  }
}