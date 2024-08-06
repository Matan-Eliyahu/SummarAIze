import { Document, Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import { PlanType } from "../common/types";

export interface IUser {
  fullName: string;
  email: string;
  plan: PlanType;
  password: string;
  imageUrl: string;
  refreshTokens?: string[];
  _id?: string;
}

const userSchema = new Schema<IUser & Document>({
  fullName: { type: String, required: [true, "Please provide full name"] },
  plan: { type: String, enum: ["basic", "pro", "premium", "none"], required: true },
  email: { type: String, required: [true, "Please provide your email"], unique: true },
  password: { type: String, required: [true, "Please provide password"], minlength: 8 },
  imageUrl: { type: String, default: "" },
  refreshTokens: { type: [String], required: false },
});

userSchema.pre("save", async function (next) {
  // Use salt to save the password on db
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

const UserModel = model<IUser & Document>("User", userSchema);

export default UserModel;
