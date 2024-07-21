import { Response } from "express";
import FileModel from "../models/FileModel";
import { AuthRequest } from "./AuthController";

export interface IStorage {
  totalSize: number;
  pdfCount: number;
  imageCount: number;
  audioCount: number;
}

class StorageController {
  async getStorageInfo(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user._id;

    try {
      const userFiles = await FileModel.find({ userId });

      const totalSize = userFiles.reduce((acc, file) => acc + file.size, 0);
      const pdfCount = userFiles.filter((file) => file.type === "pdf").length;
      const imageCount = userFiles.filter((file) => file.type === "image").length;
      const audioCount = userFiles.filter((file) => file.type === "audio").length;

      // Prepare the response object
      const storageInfo: IStorage = {
        totalSize: +totalSize.toFixed(2),
        pdfCount,
        imageCount,
        audioCount,
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
