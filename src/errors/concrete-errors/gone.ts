import { HttpStatus } from "../../constants/index.js";
import { HttpError } from "../http-error.js";

export class GoneError extends HttpError {
  constructor(message = "Gone", details?: any) {
    super(message, HttpStatus.GONE, details);
  }
}