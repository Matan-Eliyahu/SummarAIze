import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { readFilesFromDirectory } from "../utils/files";
import { fileTypes } from "../common/types";

const PUBLIC_PATH = path.join(__dirname, "..", "..", "public");

export interface IFile {
  name: string;
  transcribe: string;
  summary: string;
  type: string;
}

class FileController {
  async getUserFiles(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const files = await this.getCombinedFilesData(userId);

      res.status(200).json(files);
    } catch (error) {
      console.error("Get user files error: ", error);
      res.status(500).send("Internal server error");
    }
  }

  private async getCombinedFilesData(userId: string): Promise<IFile[]> {
    const transcribeDir = path.join(PUBLIC_PATH, "transcribe", userId);
    const summaryDir = path.join(PUBLIC_PATH, "summary", userId);

    let files: IFile[] = [];

    for (const type of fileTypes) {
      const transcribeTypeDir = path.join(transcribeDir, type);
      const summaryTypeDir = path.join(summaryDir, type);

      if (fs.existsSync(transcribeTypeDir) && fs.existsSync(summaryTypeDir)) {
        const transcribeFiles = await readFilesFromDirectory(transcribeTypeDir);
        const summaryFiles = await readFilesFromDirectory(summaryTypeDir);

        const fileData = await Promise.all(
          transcribeFiles.map(async (file) => {
            if (summaryFiles.includes(file)) {
              // Remove the file extension (.txt) from the file name
              const fileName = path.parse(file).name;

              const transcribeContent = await fs.promises.readFile(path.join(transcribeTypeDir, file), "utf-8");
              const summaryContent = await fs.promises.readFile(path.join(summaryTypeDir, file), "utf-8");

              const newFile: IFile = {
                name: fileName,
                transcribe: transcribeContent,
                summary: summaryContent,
                type: type,
              };
              return newFile;
            }
          })
        );
        files = files.concat(fileData.filter((data) => data !== undefined));
      }
    }
    return files;
  }
}

export default new FileController();
