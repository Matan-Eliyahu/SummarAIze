import path from "path";
import fs from "fs";
import { FileType } from "../common/types";

export async function saveTextToFile(text: string, outputDir: string): Promise<void> {
  try {
    const dirPath = path.dirname(outputDir);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(`${outputDir}.txt`, text);
  } catch (error) {
    throw error;
  }
}

export async function readFilesFromDirectory(directory: string): Promise<string[]> {
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

export function getFileType(mimeType: string): FileType {
  if (mimeType.startsWith("image/")) {
    return "image";
  } else if (mimeType.startsWith("audio/")) {
    return "audio";
  } else if (mimeType === "application/pdf") {
    return "pdf";
  } else {
    throw new Error("Unsupported file type.");
  }
}