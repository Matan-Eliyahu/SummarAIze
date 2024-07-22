import { Response } from "express";
import FileModel, { IFile } from "../models/FileModel";
import { BaseController } from "./BaseController";
import { AuthRequest } from "./AuthController";

class FileController extends BaseController<IFile> {
  constructor() {
    super(FileModel);
  }

  async getUserFiles(req: AuthRequest, res: Response) {
    try {
      const userId = req.user._id;
      const files = await this.model.find({ userId });
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
}

export default new FileController();
