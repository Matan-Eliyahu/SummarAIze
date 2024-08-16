import { Document, Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import { PlanType } from "../common/types";

export type RegistrationMethod = "manual" | "google" | "github";

export interface IAccount {
  fullName: string;
  email: string;
  plan: PlanType;
  imageUrl: string;
  registrationMethod: RegistrationMethod;
  _id?: string;
}

export interface IUser extends IAccount {
  password: string;
  refreshTokens?: string[];
}

export interface IUserSearchResult {
  fullName: string;
  email: string;
  imageUrl: string;
  _id:string;
}

const userSchema = new Schema<IUser & Document>({
  fullName: { type: String, required: [true, "Please provide full name"] },
  plan: { type: String, enum: ["basic", "pro", "premium", "none"], required: true },
  email: { type: String, required: [true, "Please provide your email"], unique: true },
  password: { type: String, required: [true, "Please provide password"], minlength: 8 },
  imageUrl: { type: String, default: "" },
  refreshTokens: { type: [String], required: false },
  registrationMethod: { type: String, enum: ["manual", "google", "github"], required: true },
});

userSchema.pre("save", async function (next) {
  // Use salt to save the password on db
  if (!this.isModified("password")) return next();
  try {
    const hashedPassword = await hashPassword(this.password);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

const UserModel = model<IUser & Document>("User", userSchema);

export default UserModel;
