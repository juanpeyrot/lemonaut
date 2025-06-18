import { HttpStatus } from "../../constants/index.js";
import { HttpError } from "../http-error.js";

export class TooManyRequestsError extends HttpError {
  constructor(message = "Too Many Requests", details?: any) {
    super(message, HttpStatus.TOO_MANY_REQUESTS, details);
  }
}