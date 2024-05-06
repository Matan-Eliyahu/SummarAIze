import { Response } from "express";
import { AuthRequest } from "../common/authMiddleware";
import path from "path";
import pdfService from "../services/pdfService";
import imageService from "../services/imageService";
import audioService from "../services/audioService";

const pdf = async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }
  const fileName = path.parse(req.file.filename).name;
  const text = await pdfService(req.file.path, req.user?._id, fileName);
  // Return a response with the file details
  return res.status(201).json({
    message: "File uploaded and transcribed successfully",
    text: text,
  });
};

const image = async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }
  const fileName = path.parse(req.file.filename).name;
  const text = await imageService(req.file.path, req.user?._id, fileName);
  // Return a response with the file details
  return res.status(201).json({
    message: "File uploaded and transcribed successfully",
    text: text,
  });
};

const audio = async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }
  const fileName = path.parse(req.file.filename).name;
  const text = await audioService(req.file.path, req.user?._id, fileName);
  // Return a response with the file details
  return res.status(201).json({
    message: "File uploaded and transcribed successfully",
    text: text,
  });
};

export default {
  pdf,
  image,
  audio,
};
