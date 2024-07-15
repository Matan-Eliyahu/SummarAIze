import "dotenv/config";
import express, { Express } from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoute";
import transcribeRoutes from "./routes/transcribeRoute";
import fileRoutes from "./routes/fileRoute";

function initServer(): Promise<Express> {
  const promise = new Promise<Express>((resolve) => {
    const db = mongoose.connection;
    db.on("error", (error) => console.error(error));
    const dbUrl = process.env.DB_URL;
    mongoose.connect(dbUrl).then(() => {
      const app = express();
      app.use(express.json());
      app.use(cors());
      app.use("/auth", authRoutes);
      app.use("/transcribe", transcribeRoutes);
      app.use("/file", fileRoutes);
      resolve(app);
    });
  });

  return promise;
}

export default initServer;
