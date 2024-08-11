import path from "path";
import express from "express";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

router.use("/uploads", authMiddleware, express.static(path.join(__dirname, "..", "..", "public", "uploads")));
router.use("/profile-pictures", authMiddleware, express.static(path.join(__dirname, "..", "..", "public", "profile-pictures")));

export default router;
