import { HttpStatus } from "../../constants/index.js";
import { HttpError } from "../http-error.js";

export class BadRequestError extends HttpError {
  constructor(message = "Bad Request", details?: any) {
    super(message, HttpStatus.BAD_REQUEST, details);
  }
}