import { HttpStatus } from "../../constants/index.js";
import { HttpError } from "../http-error.js";

export class NotFoundError extends HttpError {
  constructor(message = "Not Found", details?: any) {
    super(message, HttpStatus.NOT_FOUND, details);
  }
}