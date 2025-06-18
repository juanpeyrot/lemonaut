import { HttpStatus } from "../../constants/index.js";
import { HttpError } from "../http-error.js";

export class MethodNotAllowedError extends HttpError {
  constructor(message = "Method Not Allowed", details?: any) {
    super(message, HttpStatus.METHOD_NOT_ALLOWED, details);
  }
}