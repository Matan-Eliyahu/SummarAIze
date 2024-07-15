import { Request, Response } from "express";
import fs from "fs";
import path from "path";

const getFiles = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const transcribeDir = path.join(__dirname, "..", `../transcribe/${userId}`);
    const summaryDir = path.join(__dirname, "..", `../summary/${userId}`);

    const combinedData = await getCombinedFilesData(transcribeDir, summaryDir);

    res.status(200).json(combinedData);
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

async function getCombinedFilesData(transcribeDir: string, summaryDir: string): Promise<{ name: string; transcribeContent: string; summaryContent: string; type: string }[]> {
  const fileTypes = ["pdf", "image", "audio"];
  let combinedData: { name: string; transcribeContent: string; summaryContent: string; type: string }[] = [];

  for (const fileType of fileTypes) {
    const transcribeTypeDir = path.join(transcribeDir, fileType);
    const summaryTypeDir = path.join(summaryDir, fileType);

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

            return { name: fileName, transcribeContent, summaryContent, type: fileType };
          }
        })
      );

      combinedData = combinedData.concat(fileData.filter((data) => data !== undefined));
    }
  }

  return combinedData;
}

async function readFilesFromDirectory(directory: string): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    fs.readdir(directory, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
}

export default {
  getFiles,
};
