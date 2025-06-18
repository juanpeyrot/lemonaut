import { HttpStatus } from "../../constants/index.js";
import { HttpError } from "../http-error.js";

export class UnsupportedMediaTypeError extends HttpError {
  constructor(message = "Unsupported Media Type", details?: any) {
    super(message, HttpStatus.UNSUPPORTED_MEDIA_TYPE, details);
  }
}