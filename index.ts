import { lemonaut } from "./src/app";
import { multipart } from "./src/middlewares";

const app = lemonaut();

app.use(multipart);

app.post("/upload", (req, res) => {
  console.log("Fields:", req.body);
  console.log("Files:", req.files);

  res.json({ success: true });
});

app.startMission(3000);