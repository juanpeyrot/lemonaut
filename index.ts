import { lemonaut } from "./src/app";
import { rateLimit } from "./src/middlewares";

const app = lemonaut();

app.use(rateLimit({ windowMs: 60_000, max: 10 }));

app.get("/ping", (req, res) => {
  res.json({ message: "pong" });
});

app.startMission(3000);