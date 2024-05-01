import "dotenv/config";
import express, { Express } from "express";
import mongoose from "mongoose";

function initServer(): Promise<Express> {
  const promise = new Promise<Express>((resolve) => {
    const db = mongoose.connection;
    db.on("error", (error) => console.error(error));
    const dbUrl = process.env.DB_URL;
    mongoose.connect(dbUrl).then(() => {
      const app = express();
      app.use(express.json());

      resolve(app);
    });
  });

  return promise;
}

export default initServer;
