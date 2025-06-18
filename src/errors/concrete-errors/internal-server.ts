import { HttpStatus } from "../../constants/index.js";
import { HttpError } from "../http-error.js";

export class InternalServerError extends HttpError {
  constructor(message = "Internal Server Error", details?: any) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, details);
  }
}