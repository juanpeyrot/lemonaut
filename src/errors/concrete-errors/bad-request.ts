import { HttpStatus } from "../../constants";
import { HttpError } from "../http-error";

export class BadRequestError extends HttpError {
  constructor(message = "Bad Request", details?: any) {
    super(message, HttpStatus.BAD_REQUEST, details);
  }
}