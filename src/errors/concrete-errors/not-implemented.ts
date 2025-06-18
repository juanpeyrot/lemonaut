import { HttpStatus } from "../../constants/index.js";
import { HttpError } from "../http-error.js";

export class NotImplementedError extends HttpError {
  constructor(message = "Not Implemented", details?: any) {
    super(message, HttpStatus.NOT_IMPLEMENTED, details);
  }
}