import { HttpStatus } from "../../constants";
import { HttpError } from "../http-error";

export class GoneError extends HttpError {
  constructor(message = "Gone", details?: any) {
    super(message, HttpStatus.GONE, details);
  }
}