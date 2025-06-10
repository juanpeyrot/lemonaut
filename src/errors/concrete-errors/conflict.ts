import { HttpStatus } from "../../constants";
import { HttpError } from "../http-error";

export class ConflictError extends HttpError {
  constructor(message = "Conflict", details?: any) {
    super(message, HttpStatus.CONFLICT, details);
  }
}