import { Schema, model } from "mongoose";
import { FileType } from "../common/types";

export interface ISettings {
  userId: string;
  allowedFileTypes: FileType[];
  autoSummarizeEnabled: boolean;
  smartSearchEnabled: boolean;
  clearFilesAfterDays: 0 | 30 | 60 | 90;
}

const allowedClearFileDays = [0, 30, 60, 90];

const settingsSchema = new Schema<ISettings>({
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
  },
  {
    timestamps: true,
});

const SettingsModel = model<ISettings & Document>("Settings", settingsSchema);

export default SettingsModel;
