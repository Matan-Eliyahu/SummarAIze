import { Response } from "express";
import FileModel, { IFile } from "../models/FileModel";
import { AuthRequest } from "./AuthController";

export interface IStorage {
  totalSize: number;
  pdfCount: number;
  imageCount: number;
  audioCount: number;
  lastOpened: string[];
}

class StorageController {
  async getStorageInfo(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user._id;

    try {
      const userFiles: IFile[] = await FileModel.find({ userId });

      const totalSize = userFiles.reduce((acc, file) => acc + file.size, 0);
      const pdfCount = userFiles.filter((file) => file.type === "pdf").length;
      const imageCount = userFiles.filter((file) => file.type === "image").length;
      const audioCount = userFiles.filter((file) => file.type === "audio").length;

      // Sort files by lastOpened date and take the top 3
      const lastOpenedFiles = userFiles
        .filter((file) => file.lastOpened)
        .sort((a, b) => b.lastOpened.getTime() - a.lastOpened.getTime())
        .slice(0, 2)
        .map((file) => file.name);

      // Prepare the response object
      const storageInfo: IStorage = {
        totalSize: +totalSize.toFixed(2),
        pdfCount,
        imageCount,
        audioCount,
        lastOpened: lastOpenedFiles,
      };

      // Send the response
      res.status(200).json(storageInfo);
    } catch (error) {
      console.error("Error fetching storage info:", error);
      res.status(500).send("Internal Server Error");
    }
  }
}

export default new StorageController();
