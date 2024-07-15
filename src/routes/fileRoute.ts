import express from "express";
import fileController from "../controllers/fileController";

const router = express.Router();

router.get("/:id", fileController.getFiles);

export default router;
