import App from "./src/app";

const app = App();

app.serveStatic("./public");

app.run(3000);