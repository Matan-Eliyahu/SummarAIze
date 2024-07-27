import path from "path";
import { Response } from "express";
import { AuthRequest } from "./AuthController";
import FileService from "../services/FileService";
import { getFileType } from "../utils/files";
import SettingsModel from "../models/SettingsModel";
import { FileStatus } from "../models/FileModel";
import { ISummaryOptions } from "../services/SummarizeService";

class SummarizeController {
  async createSummary(req: AuthRequest, res: Response) {
    const fileId = req.params;
    const options: ISummaryOptions = req.body.options;
  }
}

export default new SummarizeController();
