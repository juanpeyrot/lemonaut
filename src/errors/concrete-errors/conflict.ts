import { HttpStatus } from "../../constants/index.js";
import { HttpError } from "../http-error.js";

export class ConflictError extends HttpError {
  constructor(message = "Conflict", details?: any) {
    super(message, HttpStatus.CONFLICT, details);
  }
}