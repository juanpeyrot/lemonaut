import { HttpStatus } from "../../constants";
import { HttpError } from "../http-error";

export class MethodNotAllowedError extends HttpError {
  constructor(message = "Method Not Allowed", details?: any) {
    super(message, HttpStatus.METHOD_NOT_ALLOWED, details);
  }
}