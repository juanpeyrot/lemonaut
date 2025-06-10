import { HttpStatus } from "../../constants";
import { HttpError } from "../http-error";

export class ForbiddenError extends HttpError {
  constructor(message = "Forbidden", details?: any) {
    super(message, HttpStatus.FORBIDDEN, details);
  }
}