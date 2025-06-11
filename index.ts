import App from "./src/app";
import { Logger } from "./src/middlewares";
import Router from "./src/router";

const app = App();

const authRouter = Router();
authRouter.post("/login", (req, res) => res.json({ message: "Login successful" }));
authRouter.post("/register", (req, res) => res.json({ message: "Registration successful" }));

const uRouter2 = Router();
uRouter2.get("/test", (req, res) => res.json({ message: "Test route" }));

const usersRouter = Router();
usersRouter.get("/", (req, res) => res.json({ message: "List of users" }));
usersRouter.get("/:id", (req, res) => res.json({ message: `User ${req.params?.id}` }));

const apiRouter = Router();
usersRouter.use("/u2", uRouter2);
apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);

app.use("/api", Logger, apiRouter);

app.run(3000);