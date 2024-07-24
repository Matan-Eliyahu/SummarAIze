import { Response } from "express";
import path from "path";
import FileModel, { IFile } from "../models/FileModel";
import { AuthRequest } from "../controllers/AuthController";
import SettingsModel, { ISettings } from "../models/SettingsModel";
import { getFileType } from "../utils/files";
import FileService from "../services/FileService";

async function saveFilesInfo(req: AuthRequest, res: Response) {
  if (!req.files) {
    return res.status(400).send("No files uploaded");
  }

  const files = req.files as Express.Multer.File[];
  const userId = req.user._id;
  try {
    const userSettings: ISettings = await SettingsModel.findOne({ userId }); // Get user settings
    if (!userSettings) return res.status(400).send("Settings not found");
    const autoSummarize = userSettings.autoSummarizeEnabled;

    let fileName: string;
    let fileNames: string[] = [];
    const fileInfos: IFile[] = [];
    for (const file of files) {
      fileName = await FileService.generateUniqueFileName(userId, file.originalname);
      fileNames.push(fileName);
      const type = getFileType(file.mimetype);
      const size = +(file.size / (1024 * 1024)).toFixed(2);
      const status = autoSummarize ? "processing" : "unprocessed";
      const filePath = path.join(userId, type, fileName);
      const ifile: IFile = { userId, name: fileName, type, size, status, path: filePath, transcribe: "", summary: "", title: "", keywords: [], uploadedAt: new Date() };
      fileInfos.push(ifile);
    }

    await FileModel.insertMany(fileInfos); // Save files info to the database

    res.status(201).send("Files uploaded and info saved");

    if (autoSummarize) {
      files.forEach((file, index) => {
        setTimeout(async () => {
          await FileService.processFile(file, userId, fileNames[index], getFileType(file.mimetype));
        }, 0);
      });
    }
  } catch (error) {
    console.error("Error saving file info: ", error);
    return res.status(500).send("Internal server error");
  }
}

export default saveFilesInfo;
