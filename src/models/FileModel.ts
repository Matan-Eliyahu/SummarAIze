import { Document, Schema, model } from "mongoose";
import { FileType } from "../common/types";

export type FileStatus = "completed" | "processing" | "error" | "unprocessed";

export interface IFile {
  userId: string;
  name: string;
  type: FileType;
  size: number;
  path:string;
  transcribe: string;
  summary: string;
  status: FileStatus;
  uploadedAt: Date;
  lastOpened?: Date;
}

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
  status: {
    type: String,
    enum: ["completed", "processing", "error", "unprocessed"],
    required: true,
  },
  uploadedAt: { type: Date, required: true },
  lastOpened: { type: Date },
});

const FileModel = model<IFile & Document>("File", fileSchema);

export default FileModel;
