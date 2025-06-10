import { HttpError } from "../http-error";
import { HttpStatus } from "../../constants";

export class DuplicatedDataError extends HttpError {
  constructor(message = "Data already exists", details?: any) {
    super(message, HttpStatus.CONFLICT, details);
  }
}