import { HttpStatus } from "../../constants";
import { HttpError } from "../http-error";

export class TooManyRequestsError extends HttpError {
  constructor(message = "Too Many Requests", details?: any) {
    super(message, HttpStatus.TOO_MANY_REQUESTS, details);
  }
}