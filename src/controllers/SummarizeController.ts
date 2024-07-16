import path from "path";
import { Response } from "express";
import { AuthRequest } from "../common/authMiddleware";
import ImageService from "../services/ImageService";
import PdfService from "../services/PdfService";
import AudioService from "../services/AudioService";
import SummarizeService from "../services/SummarizeService";
import { saveTextToFile } from "../utils/files";

const PUBLIC_PATH = path.join(__dirname, "..", "..", "public");

class SummarizeController {
  async createSummary(req: AuthRequest, res: Response) {
    const { file } = req;
    if (!file) return res.status(400).send("No file found");

    let text: string;
    const type = file.mimetype;
    const fileName = path.parse(req.file.filename).name;
    const userId = req.user._id

    try {
      // Parse to text
      if (type.startsWith("image")) {
        text = await ImageService.convertToText(file);
      } else if (type.startsWith("audio")) {
        text = await AudioService.convertToText(file);
      } else {
        text = await PdfService.convertToText(file);
      }
      // Summarize text
      const summary = await SummarizeService.summarize(text);

      // Save text as file
      await saveTextToFile(text, path.join(PUBLIC_PATH,"transcribe",userId,fileName));
      // Save summary as file
      await saveTextToFile(summary, path.join(PUBLIC_PATH, "summary", userId, fileName));

      return res.status(201).send({ text: summary });
    } catch (error) {
      // console.log("Summarize error: ", error);
      return res.status(500).send("Internal server error");
    }
  }
}

// const summaryAdjustment = async (req, res) => {
//   try {
//     const summaryAdjustment = req.body.summaryAdjustment;
//     const summarizedText = req.body.summarizedText;
//     const userId = req.user._id;
//     const fileName = req.body.fileName;
//     const fileType = req.body.fileType;

//     const refinedText = await summaryService(summarizedText, userId, fileName, fileType, summaryAdjustment);
//     res.status(200).json({ message: "summaryAdjustment received and processed successfully", text: refinedText });
//   } catch (error) {
//     console.error("Error processing summaryAdjustment:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

export default new SummarizeController();
