import { lemonaut } from "./src/app";
import { Logger, security } from "./src/middlewares";
import Router from "./src/router";

const app = lemonaut();

app.use(security);

const authRouter = Router();
authRouter.post("/login", (req, res) => res.json({ message: req }));
authRouter.post("/register", (req, res) => res.json({ message: "Registration successful" }));

const usersRouter = Router();
usersRouter.get("/", (req, res) => res.json({ message: "List of users" }));
usersRouter.get("/:id", (req, res) => res.json({ message: `User ${req.params?.id}` }));

const apiRouter = Router();
apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);

app.use("/api", Logger, apiRouter);

app.startMission(3000);