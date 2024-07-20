import { FileType } from "../common/types";
import FileModel, { FileStatus, IFile } from "../models/FileModel";
import AudioService from "./AudioService";
import ImageService from "./ImageService";
import PdfService from "./PdfService";
import SummarizeService from "./SummarizeService";

class FileService {
  async updateOrSaveFileDetails(userId: string, fileName: string, type: FileType, status: FileStatus, transcribe: string = "", summary: string = ""): Promise<void> {
    const file = await FileModel.findOne({ userId, name: fileName });

    if (!file) {
      const newFile: IFile = {
        userId,
        name: fileName,
        type,
        transcribe: "",
        summary: "",
        status,
      };
      await FileModel.create(newFile);
    } else {
      const updateData: Partial<IFile> = { status };
      if (transcribe) {
        updateData.transcribe = transcribe;
      }
      if (summary) {
        updateData.summary = summary;
      }
      await FileModel.updateOne({ userId, name: fileName }, updateData);
    }
  }

  async processFile(file: Express.Multer.File, userId: string, fileName: string, type: FileType): Promise<void> {
    let transcribe: string;
    console.log("processing file...")

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

      console.log("done parsing text");

      if (!transcribe) throw new Error("Failed to parse text");

      // Summarize text
      const summary = await SummarizeService.summarize(transcribe);

      console.log("done summarize text");

      // // Save text as file
      // await saveTextToFile(text, path.join(PUBLIC_PATH, "transcribe", userId, type, fileName));
      // // Save summary as file
      // await saveTextToFile(summary, path.join(PUBLIC_PATH, "summary", userId, type, fileName));

      // Update file status and details in the database
      await this.updateOrSaveFileDetails(userId, fileName, type, "completed", transcribe, summary);
    } catch (error) {
      console.error("File processing error: ", error);
      await this.updateOrSaveFileDetails(userId, fileName, type, "error");
    }
  }
}

export default new FileService();
