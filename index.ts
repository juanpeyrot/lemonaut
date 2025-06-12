import { lemonaut } from "./src/app";
import { maxRequestTimeout } from "./src/middlewares/max-request-timeout";

const app = lemonaut();

app.use(maxRequestTimeout(3000));

app.get("/slow", async (req, res) => {
  await new Promise(resolve => setTimeout(resolve,5000));
  res.json({ message: "This was slow" });
});

app.startMission(3000);