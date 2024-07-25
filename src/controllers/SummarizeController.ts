import path from "path";
import { Response } from "express";
import { AuthRequest } from "./AuthController";
import FileService from "../services/FileService";
import SummarizeService from "../services/SummarizeService";
import { getFileType, saveTextToFile } from "../utils/files";
import SettingsModel from "../models/SettingsModel";
import { FileStatus } from "../models/FileModel";

const PUBLIC_PATH = path.join(__dirname, "..", "..", "public");

export interface ISummaryData {
  summarizedText: string;
  adjustment?: string;
  fileName: string;
  type: string;
}

class SummarizeController {
  async createSummary(req: AuthRequest, res: Response) {
    const { file } = req;
    if (!file) return res.status(400).send("No file found");

    const type = getFileType(file.mimetype);
    const fileName = path.parse(req.file.filename).name;
    const userId = req.user._id;

    console.log(`Summarize ${fileName}...`);

    try {
      // Get user settings
      const userSettings = await SettingsModel.findOne({ userId });
      if (!userSettings) return res.status(404).send("Settings not found");
      console.log("got user settings\n");
      // Create file in DB
      const status: FileStatus = userSettings.autoSummarizeEnabled ? "processing" : "not-summarized";
      await FileService.updateFileDetails(userId, fileName, status);
      console.log("file created on db\n");

      // Immediately respond to the client
      res.status(201).send({ message: "File processing started" });

      if (userSettings.autoSummarizeEnabled) {
        // // Add job to the queue
        // fileProcessingQueue.add({ file, userId, fileName, type });
        setTimeout(async () => {
          await FileService.processFile(file, userId, fileName, type);
        }, 0);
      }

    } catch (error) {
      console.log("Summarize error: ", error);
      return res.status(500).send("Internal server error");
    }
  }

  async summaryAdjustment(req: AuthRequest, res: Response) {
    try {
      const summaryData: ISummaryData = req.body;
      const { summarizedText, adjustment } = summaryData;
      if (adjustment) {
        const refinedText = await SummarizeService.summarize(summarizedText, adjustment);
        res.status(200).json({ text: refinedText });
      } else {
        return res.status(400).send("No adjustment");
      }
    } catch (error) {
      console.error("Error processing summaryAdjustment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

export default new SummarizeController();
