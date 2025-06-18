import { HttpStatus } from "../../constants/index.js";
import { HttpError } from "../http-error.js";

export class DuplicatedDataError extends HttpError {
  constructor(message = "Data already exists", details?: any) {
    super(message, HttpStatus.CONFLICT, details);
  }
}