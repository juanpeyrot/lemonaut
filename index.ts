import App from "./src/app";
import {
  NotFoundError,
  UnauthorizedError,
  DuplicatedDataError,
  InternalServerError,
} from "./src/errors";
import { ErrorHandler, Logger, CORS, CookieParser } from "./src/middlewares";
import { JSONParser } from "./src/parsers";

const app = App();

app.use(async (req, res, next) => {
  console.log("General middleware before routes");
  next();
});

app.useMany(
  Logger,
  CORS({
    origin: ["http://localhost:3001", "http://127.0.0.1:5500"],
    credentials: true,
  }),
  CookieParser(),
  JSONParser(),
	ErrorHandler
);

app.get("/cookies", (req, res) => {
  res.json({ cookies: req.cookies });
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

app.run(3000);