import { HttpStatus } from "../../constants";
import { HttpError } from "../http-error";

export class InternalServerError extends HttpError {
  constructor(message = "Internal Server Error", details?: any) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, details);
  }
}