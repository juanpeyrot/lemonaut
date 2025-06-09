import App from "./src/app";
import { JSONParser, URLEncodedParser } from "./src/parsers";
import { BodyParserMiddleware } from "./src/middlewares";

const app = App();

app.serveStatic("./public");

app.use(JSONParser());
app.use(URLEncodedParser());
app.use(BodyParserMiddleware);

app.post("/", (req, res) => {
  console.log(req.body);
  res.json({ message: req.body });
});

app.run(3000);