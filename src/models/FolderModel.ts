import { Document, Schema, model } from "mongoose";
import { FileStatus } from "./FileModel";

export interface IFolder {
  name: string;
  userId: string;
  filesId: string[];
  sharedWith: string[];
  isPrivate: boolean;
  totalSize:number;
  status:FileStatus;
  description?: string;
  createdAt: Date;
  updatedAt?: Date;
  _id?: string;
}

const folderSchema = new Schema<IFolder & Document>({
  name: { type: String, required: true },
  userId: { type: String, ref: "User", required: true },
  filesId: [{ type: String, ref: "File", required: true }],
  sharedWith: [{ type: String, ref: "User" }],
  isPrivate: { type: Boolean, default: true },
  totalSize: { type: Number, required: true },
  status: {
    type: String,
    enum: ["completed", "processing", "error", "not-summarized"],
    required: true,
  },
  description: { type: String, required: false },
  createdAt: { type: Date, default: Date.now, required: true },
  updatedAt: { type: Date },
});

const FolderModel = model<IFolder & Document>("Folder", folderSchema);

export default FolderModel;
