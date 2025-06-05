import App from "./src/app";

const app = App();

app.get(
  "/test",
  function middleware() {},
  function controller() {}
);
app.post("/test", (req, res) => console.log("test"));
app.patch("/test", (req, res) => console.log("test"));
app.put("/test", (req, res) => console.log("test"));
app.delete("/test", (req, res) => console.log("test"));

const start = async () => {
  app.run(3000);
};

start();
