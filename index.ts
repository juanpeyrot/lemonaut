import App from "./src/app";
import {
  NotFoundError,
  UnauthorizedError,
  DuplicatedDataError,
  InternalServerError,
} from "./src/errors";
import { ErrorHandlerMiddleware } from "./src/middlewares/error-handler";

const app = App();

app.use(async (req, res, next) => {
  console.log("General middleware before routes");
  next();
});

app.get("/notfound", (req, res) => {
  throw new NotFoundError("Resource not found");
});

app.get("/unauthorized", (req, res) => {
  throw new UnauthorizedError("You must be logged in");
});

app.get("/duplicate", (req, res) => {
  throw new DuplicatedDataError("The name is already taken");
});

app.get("/generic-error", (req, res) => {
  throw new Error("Generic error");
});

app.get("/internal-error", (req, res) => {
	throw new InternalServerError("Internal server error");
});

app.get("/", (req, res) => {
  res.json({ message: "Hello, world!" });
});

app.use(ErrorHandlerMiddleware);

app.run(3000);