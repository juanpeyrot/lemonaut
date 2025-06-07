import App from "./src/app";
import Router from "./src/router";

const app = App();

const router = Router();

router.get("/users", (req, res) => {
	res.end("User route from router instance")
});
router.get("/admins", (req, res) => res.end("Admins route"));

router.useAll((req, res, next) => {
  console.log("middleware for router instance /admins and /users");
  next();
});

router.use("/users", (req, res, next: () => void) => {
  console.log("middleware for /users");
  next();
});

router.use("/admins", (req, res, next) => {
  console.log("middleware for /admins");
  next();
});

app.useRouter("", router);

app.use("/admins", (req, res, next) => {
  console.log("middleware for all admins routes");
  next();
});

app.useAll((req, res, next) => {
  console.log("middleware for all routes");
  next();
});

console.log("ROUTES:", [...router.getRoutes().entries()]);

app.run(3000);