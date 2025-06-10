import { HttpStatus } from "../../constants";
import { HttpError } from "../http-error";

export class UnprocessableEntityError extends HttpError {
	constructor(message = "Unprocessable Entity", details?: any) {
		super(message, HttpStatus.UNPROCESSABLE_ENTITY, details);
	}
}