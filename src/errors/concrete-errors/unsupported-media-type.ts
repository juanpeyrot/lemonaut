import { HttpStatus } from "../../constants";
import { HttpError } from "../http-error";

export class UnsupportedMediaTypeError extends HttpError {
  constructor(message = "Unsupported Media Type", details?: any) {
    super(message, HttpStatus.UNSUPPORTED_MEDIA_TYPE, details);
  }
}