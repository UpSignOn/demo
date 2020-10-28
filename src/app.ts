import express from "express";
import { startServer } from "./helpers/serverProcess";
import { demoApiRouter } from "./routes/demoApi";

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "3Mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/demo", demoApiRouter);
app.use(express.static("public"));

if (module === require.main) {
  startServer(app);
}

module.exports = app;
