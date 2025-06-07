import App from "./src/app";

const app = App();

app.get("/params/:id/:name", (req, res) => {
  res.end(JSON.stringify({ params: req.params, query: req.query }, null, 2));
});

app.get("/response/:id", (req, res) => {
  if (req.params?.id === "123") {
    res.status(200).json(req.params);
    return;
  }

  res.status(400).json({ message: "Invalid id" });
});

const start = async () => {
  app.run(3000);
};

start();