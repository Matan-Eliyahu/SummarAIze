import { Document, Schema, model } from "mongoose";
import { FileType } from "../common/types";
import { ISummaryOptions } from "../services/TextService";

export type FileStatus = "completed" | "processing" | "error" | "not-summarized";

export interface IFileInfo {
  userId: string;
  name: string;
  type: FileType;
  size: number;
  title: string;
  keywords: string[];
  status: FileStatus;
  uploadedAt: Date;
  lastOpened?: Date;
  _id?: string;
  folderId?: string;
}

export interface IFile extends IFileInfo {
  path: string;
  transcribe: string;
  summary: string;
  summaryOptions: ISummaryOptions;
}

const summaryOptionsSchema = new Schema<ISummaryOptions>({
  length: { type: String, enum: ["short", "medium", "long"], required: true },
  language: { type: String, enum: ["auto", "english", "spanish", "french", "german", "chinese", "japanese", "korean", "russian", "arabic", "portuguese", "italian", "hindi", "bengali","hebrew"], required: true },
  tone: { type: String, enum: ["formal", "informal", "neutral"], required: true },
  detailLevel: { type: String, enum: ["high", "medium", "low"], required: true },
  keywords: { type: [String], required: true },
});

const fileSchema = new Schema<IFile & Document>({
  userId: { type: String, ref: "User", required: true },
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ["pdf", "image", "audio"],
    required: true,
  },
  size: { type: Number, required: true },
  path: { type: String, required: true },
  transcribe: { type: String, default: "" },
  summary: { type: String, default: "" },
  title: { type: String, default: "" },
  keywords: { type: [String], default: [] },
  status: {
    type: String,
    enum: ["completed", "processing", "error", "not-summarized"],
    required: true,
  },
  summaryOptions: { type: summaryOptionsSchema, required: true },
  uploadedAt: { type: Date, required: true },
  lastOpened: { type: Date },
  folderId: { type: String, ref: "Folder" },
});

const FileModel = model<IFile & Document>("File", fileSchema);

export default FileModel;
