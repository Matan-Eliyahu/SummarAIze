import { Schema, model } from "mongoose";
import { FileListView, FileType } from "../common/types";
import { ISummaryOptions } from "../services/SummarizeService";

export interface ISettings {
  userId: string;
  allowedFileTypes: FileType[];
  autoSummarizeEnabled: boolean;
  smartSearchEnabled: boolean;
  clearFilesAfterDays: 0 | 30 | 60 | 90;
  defaultFileView: FileListView;
  summaryOptions: ISummaryOptions;
  _id?: string;
}

const allowedClearFileDays = [0, 30, 60, 90];

const summaryOptionsSchema = new Schema<ISummaryOptions>({
  length: { type: String, enum: ["short", "medium", "long"], required: true },
  language: { type: String, enum: ["auto", "english", "spanish", "french", "german", "chinese", "japanese", "korean", "russian", "arabic", "portuguese", "italian", "hindi", "bengali"], required: true },
  tone: { type: String, enum: ["formal", "informal", "neutral"], required: true },
  detailLevel: { type: String, enum: ["high", "medium", "low"], required: true },
  keywords: { type: [String], required: true },
});

const settingsSchema = new Schema<ISettings>(
  {
    userId: { type: String, ref: "User", required: true },
    allowedFileTypes: { type: [String], enum: ["pdf", "image", "audio"], required: true },
    autoSummarizeEnabled: { type: Boolean, default: false },
    smartSearchEnabled: { type: Boolean, default: true },
    clearFilesAfterDays: {
      type: Number,
      required: true,
      validate: {
        validator: function (value: number) {
          return allowedClearFileDays.includes(value);
        },
        message: (props: { value: number }) => `${props.value} is not a valid option for clearFilesAfterDays`,
      },
    },
    defaultFileView: {
      type: String,
      enum: ["icons", "list"],
      required: true,
    },
    summaryOptions: { type: summaryOptionsSchema, required: true },
  },
  {
    timestamps: true,
  }
);

const SettingsModel = model<ISettings & Document>("Settings", settingsSchema);

export default SettingsModel;
