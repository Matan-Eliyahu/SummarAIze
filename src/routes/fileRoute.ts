import express from "express";
import FileController from "../controllers/FileController";

const router = express.Router();

router.get("/:id", FileController.getUserFiles.bind(FileController));

export default router;
