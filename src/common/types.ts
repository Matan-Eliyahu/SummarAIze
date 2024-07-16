export interface FileToTextConverter {
  convertToText(file: Express.Multer.File): Promise<string>;
}

export type FileType = "pdf" | "image" | "audio";
export const fileTypes = ["pdf", "image", "audio"];
