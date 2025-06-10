import { HttpStatus } from "../../constants";
import { HttpError } from "../http-error";

export class NotImplementedError extends HttpError {
  constructor(message = "Not Implemented", details?: any) {
    super(message, HttpStatus.NOT_IMPLEMENTED, details);
  }
}