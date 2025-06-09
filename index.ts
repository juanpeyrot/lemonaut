import App from "./src/app";
import { JSONParser, URLEncodedParser } from "./src/parsers";
import { BodyParserMiddleware } from "./src/middlewares";
import Router from "./src/router";

const app = App();

app.serveStatic("./public");

const adminRouter = Router();
adminRouter.get("/tuco", (req, res) => {
	res.json({ message: "Hello Tuco!" });
}
);

app.use(JSONParser());
app.use(URLEncodedParser());
app.use(BodyParserMiddleware);

app.useRouter("/admin", adminRouter);

app.post("/", (req, res) => {
  console.log(req.body, req.params, req.query);
  res.json({ message: req.body });
});

app.run(3000);