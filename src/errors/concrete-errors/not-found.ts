import { HttpError } from "../http-error";
import { HttpStatus } from "../../constants";

export class NotFoundError extends HttpError {
  constructor(message = "Not found", details?: any) {
    super(message, HttpStatus.NOT_FOUND, details);
  }
}