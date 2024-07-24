import { Response } from "express";
import path from "path";
import fs from "fs";
import FileModel, { IFile } from "../models/FileModel";
import { BaseController } from "./BaseController";
import { AuthRequest } from "./AuthController";
import { UPLOADS_PATH } from "../common/multer";

class FileController extends BaseController<IFile> {
  constructor() {
    super(FileModel);
  }

  async getUserFiles(req: AuthRequest, res: Response) {
    const query = req.query.query as string;
    try {
      const userId = req.user._id;
      const files = await this.model.find({ userId });
      if (query) {
        const lowerCaseQuery = query.toLowerCase();
        const filteredFiles = files.filter((file) => file.name.toLowerCase().includes(lowerCaseQuery) || file.title.toLowerCase().includes(lowerCaseQuery) || file.keywords.find((keyword) => keyword.toLowerCase().includes(lowerCaseQuery)));
        return res.status(200).send(filteredFiles);
      }
      return res.status(200).send(files);
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
  }

  async getFileByName(req: AuthRequest, res: Response) {
    try {
      const userId = req.user._id;
      const fileName = req.params.fileName;
      const file = await this.model.findOne({ userId, name: fileName });
      file.lastOpened = new Date();
      await file.save();
      return res.status(200).send(file);
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
  }

  async deleteFileByName(req: AuthRequest, res: Response) {
    const userId = req.user._id;
    const fileName = req.params.fileName;
    try {
      const file = await this.model.findOne({ userId, name: fileName });
      if (!file) {
        return res.status(404).send("File not found");
      }
      const filePath = path.join(UPLOADS_PATH, file.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      } else {
        console.warn(`File ${filePath} does not exist`);
      }
      await this.model.deleteOne({ userId, name: fileName });

      return res.status(200);
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
  }

  async deleteFilesByName(req: AuthRequest, res: Response) {
    const userId = req.user._id;
    const { fileNames } = req.body;
    try {
      if (!Array.isArray(fileNames) || fileNames.length === 0) {
        return res.status(400).send("No file names provided");
      }

      const deleteResults = await Promise.all(
        fileNames.map(async (fileName) => {
          const file = await this.model.findOne({ userId, name: fileName });
          if (!file) {
            return { fileName, status: "not_found" };
          }

          const filePath = path.join(UPLOADS_PATH, file.path);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          } else {
            console.warn(`File ${filePath} does not exist`);
          }
          await this.model.deleteOne({ userId, name: fileName });
          return { fileName, status: "deleted" };
        })
      );

      return res.status(200).send(deleteResults);
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
  }

  async updateFileByName(req: AuthRequest, res: Response) {
    const userId = req.user._id;
    const fileName = req.params.fileName;
    const { transcribe, summary } = req.body;
    try {
      const file = await this.model.findOne({ userId, name: fileName });
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
}

export default new FileController();
