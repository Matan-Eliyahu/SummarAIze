import { Express } from "express";
import mongoose from "mongoose";
import "dotenv/config";

const dbUrl = process.env.DB_URL;

mongoose
  .connect(dbUrl)
  .then((mon) => console.log("connected to DB"))
  .catch((err) => console.log(err));
