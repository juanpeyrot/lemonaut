import { HttpStatus } from "../../constants/index.js";
import { HttpError } from "../http-error.js";

export class UnauthorizedError extends HttpError {
  constructor(message = "Unauthorized", details?: any) {
    super(message, HttpStatus.UNAUTHORIZED, details);
  }
}