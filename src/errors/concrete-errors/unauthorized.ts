import { HttpStatus } from "../../constants";
import { HttpError } from "../http-error";

export class UnauthorizedError extends HttpError {
  constructor(message = "Unauthorized", details?: any) {
    super(message, HttpStatus.UNAUTHORIZED, details);
  }
}