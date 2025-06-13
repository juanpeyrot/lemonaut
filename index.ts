import { lemonaut } from "./src/app";
import { rateLimit } from "./src/middlewares";

const app = lemonaut();

app.use(rateLimit(3000));

app.get("/slow", async (req, res) => {
  await new Promise(resolve => setTimeout(resolve,5000));
  res.json({ message: "This was slow" });
});

app.startMission(3000);