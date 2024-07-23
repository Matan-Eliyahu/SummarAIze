import "dotenv/config";
import express, { Express } from "express";
import http, { Server as HttpServer } from "http";
import WebSocket, { Server as WebSocketServer } from "ws";
import cors from "cors";
import mongoose from "mongoose";
import AuthRoute from "./routes/AuthRoute";
import FileRoute from "./routes/FileRoute";
import SettingsRoute from "./routes/SettingsRoute";
import UploadRoute from "./routes/UploadRoute";
import StorageRoute from "./routes/StorageRoute";
import UploadsStaticRoute from "./routes/UploadsStaticRoute";

export const clients = new Map<string, WebSocket>();

function initServer() {
  const promise = new Promise<[HttpServer, Express, WebSocketServer]>((resolve) => {
    const db = mongoose.connection;
    db.on("error", (error) => console.error(error));
    const dbUrl = process.env.DB_URL;
    mongoose.connect(dbUrl).then(() => {
      console.log(">> DB connected");
      const app = express();
      app.use(express.json());
      app.use(cors());
      app.use("/auth", AuthRoute);
      app.use("/settings", SettingsRoute);
      app.use("/upload", UploadRoute);
      app.use("/files", FileRoute);
      app.use("/storage", StorageRoute);
      app.use("/", UploadsStaticRoute); // Static

      const server = http.createServer(app);
      const wss = new WebSocket.Server({ server });

      wss.on("connection", (ws, req) => {
        const userId = new URLSearchParams(req.url?.split("?")[1]).get("userId");
        if (userId) {
          clients.set(userId, ws);

          ws.on("close", () => {
            clients.delete(userId);
          });
        }
      });

      resolve([server, app, wss]);
    });
  });

  return promise;
}

export default initServer;
