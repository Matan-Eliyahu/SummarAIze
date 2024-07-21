import { FileType } from "../common/types";
import FileModel, { FileStatus, IFile } from "../models/FileModel";
import AudioService from "./AudioService";
import ImageService from "./ImageService";
import PdfService from "./PdfService";
import SummarizeService from "./SummarizeService";

class FileService {
  async updateFileDetails(userId: string, fileName: string, status: FileStatus, transcribe: string = "", summary: string = ""): Promise<void> {
    const file = await FileModel.findOne({ userId, name: fileName });

    if (file) {
      const updateData: Partial<IFile> = { status };
      if (transcribe) {
        updateData.transcribe = transcribe;
      }
      if (summary) {
        updateData.summary = summary;
      }
      await FileModel.updateOne({ userId, name: fileName }, { $set: updateData });
    } else {
      console.error(`File with name ${fileName} for user ${userId} not found`);
    }
  }

  async processFile(file: Express.Multer.File, userId: string, fileName: string, type: FileType): Promise<void> {
    let transcribe: string;
    console.log(`processing ${file.originalname}...`);

    try {
      // Parse to text
      switch (type) {
        case "image":
          transcribe = await ImageService.convertToText(file);
          break;
        case "audio":
          transcribe = await AudioService.convertToText(file);
          break;
        case "pdf":
          transcribe = await PdfService.convertToText(file);
          break;
        default:
          transcribe = null;
      }

      if (!transcribe) throw new Error("Failed to parse text");

      // Summarize text
      const summary = await SummarizeService.summarize(transcribe);

      // // Save text as file
      // await saveTextToFile(text, path.join(PUBLIC_PATH, "transcribe", userId, type, fileName));
      // // Save summary as file
      // await saveTextToFile(summary, path.join(PUBLIC_PATH, "summary", userId, type, fileName));

      // Update file status and details in the database
      await this.updateFileDetails(userId, fileName, "completed", transcribe, summary);
          console.log(`${file.originalname} is done.`);

    } catch (error) {
      console.error("File processing error: ", error);
      await this.updateFileDetails(userId, fileName, "error");
    }
  }
}

export default new FileService();
