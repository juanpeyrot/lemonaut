import { HttpStatus } from "../../constants/index.js";
import { HttpError } from "../http-error.js";

export class ForbiddenError extends HttpError {
  constructor(message = "Forbidden", details?: any) {
    super(message, HttpStatus.FORBIDDEN, details);
  }
}