export interface FileToTextConverter {
  convertToText(file: Express.Multer.File): Promise<string>;
}

export interface IAuth {
  id: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}

export type FileType = "pdf" | "image" | "audio";
export const fileTypes = ["pdf", "image", "audio"];
