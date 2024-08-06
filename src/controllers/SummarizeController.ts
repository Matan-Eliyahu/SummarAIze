import { Response } from "express";
import { AuthRequest } from "./AuthController";
import FileModel from "../models/FileModel";
import SummarizeService from "../services/SummarizeService";

class SummarizeController {
  async summarize(req: AuthRequest, res: Response) {
    const { fileId } = req.params;
    const summaryOptions = req.body;
    if (!summaryOptions) res.status(403).send("No summary options");
    try {
      const file = await FileModel.findOne({ _id: fileId });
      if (!file) {
        return res.status(404).send("File not found.");
      }
      const summary = await SummarizeService.summarize(file.transcribe, summaryOptions);
      file.summary = summary;
      await file.save();

      return res.status(200).send(file);
    } catch (error) {
      console.error("Error summarizing:", error);
      return res.status(500).send("Internal server error.");
    }
  }
}

export default new SummarizeController();
