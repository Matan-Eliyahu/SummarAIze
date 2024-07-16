import path from "path";
import { Response } from "express";
import { AuthRequest } from "./AuthController";
import ImageService from "../services/ImageService";
import PdfService from "../services/PdfService";
import AudioService from "../services/AudioService";
import SummarizeService from "../services/SummarizeService";
import { getFileType, saveTextToFile } from "../utils/files";

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

    let text: string;
    const type = getFileType(file.mimetype);
    const fileName = path.parse(req.file.filename).name;
    const userId = req.user._id;

    try {
      // Parse to text
      switch (type) {
        case "image":
          text = await ImageService.convertToText(file);
          break;
        case "audio":
          text = await AudioService.convertToText(file);
          break;
        case "pdf":
          text = await PdfService.convertToText(file);
          break;
        default:
          text = null;
      }

      if (!text) return res.status(400).send("Faild to parse text");

      // Summarize text
      const summary = await SummarizeService.summarize(text);

      // Save text as file
      await saveTextToFile(text, path.join(PUBLIC_PATH, "transcribe", userId, type, fileName));
      // Save summary as file
      await saveTextToFile(summary, path.join(PUBLIC_PATH, "summary", userId, type, fileName));

      return res.status(201).send({ text: summary });
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
