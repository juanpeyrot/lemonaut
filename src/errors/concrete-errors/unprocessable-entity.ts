import { HttpStatus } from "../../constants/index.js";
import { HttpError } from "../http-error.js";

export class UnprocessableEntityError extends HttpError {
	constructor(message = "Unprocessable Entity", details?: any) {
		super(message, HttpStatus.UNPROCESSABLE_ENTITY, details);
	}
}