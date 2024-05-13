import { Response } from "express";
import { AuthRequest } from "../common/authMiddleware";
import path from "path";
import pdfService from "../services/pdfService";
import imageService from "../services/imageService";
import audioService from "../services/audioService";
import summaryService from "../services/summaryService";

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

const summary = async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  let text;
  let fileType;
  const fileName = path.parse(req.file.filename).name;

   if (req.file.mimetype.startsWith("image")) {
    text = await imageService(req.file.path, req.user?._id, fileName);
    fileType = "image";
  } else if (req.file.mimetype.startsWith("audio")) {
    text = await audioService(req.file.path, req.user?._id, fileName);
    fileType = "audio";
  } else {
    text = await pdfService(req.file.path, req.user?._id, fileName);
    fileType = "pdf";
  }

  const summarizeText = await summaryService(text, req.user?._id, fileName, fileType);
  // Return a response with the file details
  return res.status(201).json({
    message: "File uploaded, transcribed and summarized successfully",
    text: summarizeText,
  });
};

const summaryAdjustment = async (req, res) => {
  try {
    const summaryAdjustment = req.body.summaryAdjustment;
    const summarizedText = req.body.summarizedText;
    const userId = req.user._id;
    const fileName = req.body.fileName;
    const fileType = req.body.fileType;
    
    const refinedText = await summaryService(summarizedText, userId, fileName, fileType, summaryAdjustment);
    res.status(200).json({ message: "summaryAdjustment received and processed successfully", text: refinedText });
  } catch (error) {
      console.error("Error processing summaryAdjustment:", error);
      res.status(500).json({ error: "Internal server error" });
  }
};


export default {
  pdf,
  image,
  audio,
  summary,
  summaryAdjustment
};
