import { Response } from "express";
import path from "path";
import FileModel, { IFile } from "../models/FileModel";
import { AuthRequest } from "../controllers/AuthController";
import { getFileType } from "../utils/files";
import FileService from "../services/FileService";
import SettingsModel, { ISettings } from "../models/SettingsModel";
import FolderModel from "../models/FolderModel";

async function saveFilesInfo(req: AuthRequest, res: Response) {
  if (!req.files) {
    return res.status(400).send("No files uploaded");
  }

  const files = req.files as Express.Multer.File[];
  const userId = req.user._id;
  const folderId = (req.query.folderId as string) || null;
  console.log("******** ", req.query, " *********");

  try {
    let fileName: string;
    let fileNames: string[] = [];
    let fileIds: string[] = [];
    const fileInfos: IFile[] = [];
    const userSettings: ISettings = await SettingsModel.findOne({ userId });
    for (const file of files) {
      fileName = await FileService.generateUniqueFileName(userId, file.originalname);
      fileNames.push(fileName);
      const type = getFileType(file.mimetype);
      const size = +(file.size / (1024 * 1024)).toFixed(2);
      const status = "processing";
      const filePath = path.join(userId, type, fileName);
      const ifile: IFile = { userId, name: fileName, type, size, status, path: filePath, transcribe: "", summary: "", title: "", keywords: [], uploadedAt: new Date(), summaryOptions: userSettings.summaryOptions, folderId };
      fileInfos.push(ifile);
    }

    const ifiles: IFile[] = await FileModel.insertMany(fileInfos);

    for (const ifile of ifiles) fileIds.push(ifile._id);

    // Update folder
    if (folderId) {
      const folder = await FolderModel.findById({ _id: folderId });

      if (!folder) {
        return res.status(400).send("Folder not found");
      }

      for (const ifile of ifiles) {
        folder.filesId.push(ifile._id);
        folder.totalSize += ifile.size;
      }

      folder.updatedAt = new Date();
      folder.status = userSettings.autoSummarizeEnabled ? "processing" : "not-summarized";
      await folder.save();
    }

    // Return response
    res.status(201).send();

    // Continue processing
    for (let i = 0; i < files.length; i++) {
      setTimeout(async () => {
        await FileService.processFile(files[i], userId, fileNames[i], fileIds[i], getFileType(files[i].mimetype));
      }, 0);
    }
  } catch (error) {
    console.error("Error saving file info: ", error);
    return res.status(500).send("Internal server error");
  }
}

export default saveFilesInfo;
