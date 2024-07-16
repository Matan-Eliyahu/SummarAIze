import "dotenv/config";
import express, { Express } from "express";
import cors from "cors";
import mongoose from "mongoose";
import AuthRoute from "./routes/AuthRoute"
import SummarizeRoute from "./routes/SummarizeRoute";
import FileRoute from "./routes/FileRoute";

function initServer(): Promise<Express> {
  const promise = new Promise<Express>((resolve) => {
    const db = mongoose.connection;
    db.on("error", (error) => console.error(error));
    const dbUrl = process.env.DB_URL;
    mongoose.connect(dbUrl).then(() => {
      console.log(">> DB connected");
      const app = express();
      app.use(express.json());
      app.use(cors());
      app.use("/auth", AuthRoute);
      app.use("/summarize", SummarizeRoute);
      app.use("/file", FileRoute);
      resolve(app);
    });
  });

  return promise;
}

export default initServer;
