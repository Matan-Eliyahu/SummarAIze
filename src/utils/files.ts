import path from "path";
import fs from "fs";

export async function saveTextToFile(text: string, outputDir: string): Promise<void> {
  try {
    const dirPath = path.dirname(outputDir);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(outputDir, text);
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