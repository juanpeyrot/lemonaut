import { HttpStatus } from "../../constants";
import { HttpError } from "../http-error";

export class BadRequestError extends HttpError {
  constructor(message = "Bad request", details?: any) {
    super(message, HttpStatus.BAD_REQUEST, details);
  }
}