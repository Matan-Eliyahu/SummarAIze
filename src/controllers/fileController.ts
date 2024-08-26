import { Response } from "express";
import path from "path";
import fs from "fs";
import FileModel, { IFile, IFileInfo } from "../models/FileModel";
import { BaseController } from "./BaseController";
import { AuthRequest } from "./AuthController";
import { UPLOADS_PATH } from "../common/multer";
import { isDateStringValid, isValidYearMonthDay, parseDate } from "../utils/date";
import FolderModel from "../models/FolderModel";

class FileController extends BaseController<IFile> {
  constructor() {
    super(FileModel);
  }

  async getUserFiles(req: AuthRequest, res: Response) {
    const userId = req.user._id;
    const query = (req.query.query as string) || "";
    try {
      const folders = await FolderModel.find({
        $or: [{ userId }, { sharedWith: [userId] }],
      }).lean();

      const folderIds = folders.map((folder) => folder._id);

      const files: IFileInfo[] = await this.model
        .find({
          $or: [{ userId }, { folderId: { $in: folderIds } }],
        })
        .select("-path -transcribe -summary")
        .lean();

      const dateMatches = isDateStringValid(query);
      const yearMonthDayMatches = isValidYearMonthDay(query);
      let date: Date | null = null;
      let numericDate: number | null = null;

      if (dateMatches) {
        date = new Date(query);
      }

      if (yearMonthDayMatches.isValid) {
        numericDate = parseInt(query, 10);
      }

      let filteredFiles: IFileInfo[];

      // Filter based on query string
      filteredFiles = files.filter((file) => {
        const lowerCaseQuery = query.toLowerCase();
        const nameMatch = file.name.toLowerCase().includes(lowerCaseQuery);
        const titleMatch = file.title.toLowerCase().includes(lowerCaseQuery);
        const keywordsMatch = file.keywords.some((keyword) => keyword.toLowerCase().includes(lowerCaseQuery));

        if (date) {
          const uploadedAtMatch = file.uploadedAt.toDateString() === date.toDateString();
          const lastOpenedMatch = file.lastOpened ? file.lastOpened.toDateString() === date.toDateString() : false;
          return nameMatch || titleMatch || keywordsMatch || uploadedAtMatch || lastOpenedMatch;
        }

        if (numericDate) {
          const uploadedAtMatch = file.uploadedAt.getFullYear() === numericDate || file.uploadedAt.getMonth() + 1 === numericDate || file.uploadedAt.getDate() === numericDate;
          const lastOpenedMatch = file.lastOpened ? file.lastOpened.getFullYear() === numericDate || file.lastOpened.getMonth() + 1 === numericDate || file.lastOpened.getDate() === numericDate : false;
          return nameMatch || titleMatch || keywordsMatch || uploadedAtMatch || lastOpenedMatch;
        }

        return nameMatch || titleMatch || keywordsMatch;
      });

      return res.status(200).send(filteredFiles);
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
  }

  async getFileById(req: AuthRequest, res: Response) {
    try {
      const fileId = req.params.fileId;
      const file = await this.model.findById(fileId);
      file.lastOpened = new Date();
      await file.save();
      return res.status(200).send(file);
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
  }

  async updateFileById(req: AuthRequest, res: Response) {
    const fileId = req.params.fileId;
    const { transcribe, summary } = req.body;
    try {
      const file = await this.model.findById(fileId);
      if (!file) {
        return res.status(404).send("File not found");
      }
      if (transcribe) {
        file.transcribe = transcribe.trim();
      }
      if (summary) {
        file.summary = summary.trim();
      }
      await file.save();

      return res.status(200).send(file);
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
  }

  async deleteFileById(req: AuthRequest, res: Response) {
    const fileId = req.params.fileId;
    try {
      const file = await this.model.findById(fileId);
      if (!file) {
        return res.status(404).send("File not found");
      }
      if (file.folderId) {
        const folder = await FolderModel.findById(file.folderId);
        if (!folder) {
          return res.status(404).send("Folder not found");
        }
        folder.filesId = folder.filesId.filter((id) => id.toString() !== fileId);
        folder.totalSize -= file.size;
        await folder.save();
      }
      const filePath = path.join(UPLOADS_PATH, file.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      } else {
        console.warn(`File ${filePath} does not exist`);
      }
      await this.model.deleteOne({ _id: fileId });

      return res.status(204).send();
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
  }

  async deleteMultipleFilesById(req: AuthRequest, res: Response) {
    const filesId = req.body.filesId as string[];
    try {
      if (!Array.isArray(filesId) || filesId.length === 0) {
        return res.status(400).send("No file names provided");
      }

      const deleteResults = await Promise.all(
        filesId.map(async (fileId) => {
          const file = await this.model.findById(fileId);
          if (!file) {
            return { fileId, status: "not_found" };
          }

          if (file.folderId) {
            const folder = await FolderModel.findByIdAndUpdate(
              file.folderId,
              {
                $pull: { filesId: fileId },
                $inc: { totalSize: -file.size },
              },
              { new: true }
            );

            if (!folder) {
              return res.status(404).send("Folder not found");
            }
          }

          const filePath = path.join(UPLOADS_PATH, file.path);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          } else {
            console.warn(`File ${filePath} does not exist`);
          }
          await this.model.deleteOne({ _id: fileId });
          return { fileId, status: "deleted" };
        })
      );

      return res.status(200).send(deleteResults);
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
  }
}

export default new FileController();
