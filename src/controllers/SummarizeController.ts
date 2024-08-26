import { Response } from "express";
import { AuthRequest } from "./AuthController";
import FileModel, { IFile } from "../models/FileModel";
import TextService from "../services/TextService";

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
      if (!file.transcribe) {
        return res.status(404).send("Transcribe not found.");        
      }
      const summary = await TextService.summarize(file.transcribe, summaryOptions);
      file.summary = summary;
      file.summaryOptions = summaryOptions;
      if (file.status !== "completed") file.status = "completed";
      await file.save();

      return res.status(200).send(file as IFile);
    } catch (error) {
      console.error("Error summarizing:", error);
      return res.status(500).send("Internal server error.");
    }
  }
}

export default new SummarizeController();
