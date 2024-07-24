import { FileType } from "../common/types";
import path from "path";
import FileModel, { FileStatus, IFile } from "../models/FileModel";
import AudioService from "./AudioService";
import ImageService from "./ImageService";
import PdfService from "./PdfService";
import SummarizeService from "./SummarizeService";
import { clients } from "../server";
import WebSocket from "ws";

interface IUpdate {
  fileName: string;
  status: string;
}

class FileService {
  async updateFileDetails(userId: string, fileName: string, status: FileStatus, transcribe: string = "", summary: string = "", title: string = "", keywords: string[] = []): Promise<void> {
    const file = await FileModel.findOne({ userId, name: fileName });

    if (file) {
      const updateData: Partial<IFile> = { status };
      if (transcribe) {
        updateData.transcribe = transcribe;
      }
      if (summary) {
        updateData.summary = summary;
      }
      if (title) {
        updateData.title = title;
      }
      if (keywords) {
        updateData.keywords = keywords;
      }
      await FileModel.updateOne({ userId, name: fileName }, { $set: updateData });
    } else {
      console.error(`File with name ${fileName} for user ${userId} not found`);
    }
  }

  async processFile(file: Express.Multer.File, userId: string, fileName: string, type: FileType): Promise<void> {
    let transcribe: string;
    let status: FileStatus;

    console.log(`processing ${fileName}...`);

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
      transcribe = transcribe.trim();

      console.log(`done parsing text from ${fileName}`);

      // Summarize text
      const summary = await SummarizeService.summarize(transcribe);

      const { keywords, title } = await SummarizeService.extractKeywordsAndTitle(transcribe);

      console.log(`${fileName} done.\n`);

      // Update file status and details in the database
      status = "completed";
      await this.updateFileDetails(userId, fileName, status, transcribe, summary, title, keywords);
    } catch (error) {
      status = "error";
      await this.updateFileDetails(userId, fileName, status);
      console.error("File processing error: ", error);
    } finally {
      // Send WebSocket update
      const client = clients.get(userId);
      if (client && client.readyState === WebSocket.OPEN) {
        const update: IUpdate = {
          fileName,
          status,
        };
        client.send(JSON.stringify(update));
      }
    }
  }

  async generateUniqueFileName(userId: string, originalName: string): Promise<string> {
    const baseName = path.basename(originalName, path.extname(originalName));
    const extension = path.extname(originalName);
    let fileName = originalName;
    let counter = 1;

    while (await FileModel.findOne({ userId, name: fileName })) {
      fileName = `${baseName}(${counter})${extension}`;
      counter++;
    }

    return fileName;
  }
}

export default new FileService();
