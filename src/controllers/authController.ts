import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import UserModel, { IUser } from "../models/UserModel";
import { Document } from "mongoose";
import axios from "axios";
import SettingsModel, { ISettings } from "../models/SettingsModel";
import { PlanType } from "../common/types";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION;
const GOOGLE_USER_INFO_URL = process.env.GOOGLE_USER_INFO_URL;

export interface AuthRequest extends Request {
  user?: { _id: string };
}

export interface IAuth {
  userId: string;
  plan: PlanType;
  fullName: string;
  email: string;
  imageUrl: string;
  tokens: ITokens;
}

export interface ITokens {
  accessToken: string;
  refreshToken: string;
}

interface GoogleUserInfo {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
}

async function generateTokens(user: Document & IUser) {
  const userPayload = { _id: user._id, time: new Date() };
  const accessToken = jwt.sign(userPayload, JWT_ACCESS_SECRET, { expiresIn: JWT_EXPIRATION });
  const refreshToken = jwt.sign(userPayload, JWT_REFRESH_SECRET);

  if (user.refreshTokens == null) {
    user.refreshTokens = [refreshToken];
  } else {
    user.refreshTokens.push(refreshToken);
  }

  await user.save();

  const tokens: ITokens = {
    accessToken,
    refreshToken,
  };

  return tokens;
}

async function setupUser(userData: IUser) {
  try {
    const user = await UserModel.create(userData);
    const defaultSettings: ISettings = {
      userId: user._id,
      allowedFileTypes: ["pdf", "image", "audio"],
      autoSummarizeEnabled: true,
      smartSearchEnabled: true,
      clearFilesAfterDays: 90,
      defaultFileView: "icons",
      summaryOptions: {
        length: "medium",
        language: "auto",
        tone: "neutral",
        detailLevel: "medium",
        keywords: [],
      },
    };
    await SettingsModel.create(defaultSettings);
    return user;
  } catch (error) {
    throw error;
  }
}

async function register(req: Request, res: Response) {
  const userData: IUser = req.body;
  if (!userData.email || !userData.password) {
    return res.status(400).send("Email or password is missing");
  }
  try {
    const findUser = await UserModel.findOne({ email: userData.email });
    if (findUser) {
      return res.status(406).send("Email already exists");
    }
    const user = await setupUser(userData);
    res.status(201).send({ _id: user._id });
  } catch (error) {
    console.log("Registration error: ", error);
    return res.status(400).send(error.message);
  }
}

async function login(req: Request, res: Response) {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send("Email or password is missing");
  }
  try {
    const user = await UserModel.findOne({ email: email });
    if (user == null) {
      return res.status(401).send("Incorrect email or password");
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).send("Incorrect email or password");
    }

    const tokens = await generateTokens(user);
    const auth: IAuth = {
      userId: user._id,
      fullName: user.fullName,
      plan: user.plan,
      email: user.email,
      imageUrl: user.imageUrl,
      tokens,
    };
    return res.status(200).send(auth);
  } catch (error) {
    console.log("Login error: ", error);
    return res.status(400).send("Email or password is missing");
  }
}

async function googleSignin(req: Request, res: Response) {
  const tokenResponse = req.body;
  if (!tokenResponse.access_token) return res.status(403).send("Goolge login failed");
  const { access_token: accessToken } = tokenResponse;
  try {
    const userInfo: GoogleUserInfo = await getGoolgeUserInfo(accessToken);
    const { email, given_name, family_name, picture } = userInfo;
    let user = await UserModel.findOne({ email: email });
    if (user == null) {
      const newGoogleUser: IUser = {
        fullName: given_name + " " + family_name,
        email,
        plan: "none",
        password: "googlegoogle",
        imageUrl: picture,
      };
      user = await setupUser(newGoogleUser);
    }
    const tokens = await generateTokens(user);
    const auth: IAuth = {
      userId: user._id,
      plan: user.plan,
      fullName: user.fullName,
      email: user.email,
      imageUrl: user.imageUrl,
      tokens,
    };
    res.status(200).send(auth);
  } catch (error) {
    console.log("Google singin error: ", error);
    return res.status(400).send(error.message);
  }
}

async function logout(req: Request, res: Response) {
  const authHeader = req.headers["authorization"];
  const refreshToken = authHeader && authHeader.split(" ")[1]; // JWT <refreshToken>
  if (refreshToken == null) return res.sendStatus(401);

  jwt.verify(refreshToken, JWT_REFRESH_SECRET, async (err, user) => {
    if (err) {
      console.log(err);
      return res.status(403).send(err.message);
    }
    const userPayload = user as { _id: string; time: Date };
    try {
      const user = await UserModel.findById({ _id: userPayload._id });
      if (!user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
        user.refreshTokens = []; // invalidate all user tokens
        await user.save();
        return res.status(403).send("Invalid request");
      } else {
        user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
        await user.save();
        return res.sendStatus(200);
      }
    } catch (error) {
      console.log("Logout error: ", error);
      res.status(403).send(error.message);
    }
  });
}

async function refreshToken(req: Request, res: Response) {
  const authHeader = req.headers["authorization"];
  const refreshToken = authHeader && authHeader.split(" ")[1]; // JWT <refreshToken>
  if (refreshToken == null) return res.sendStatus(401);
  jwt.verify(refreshToken, JWT_REFRESH_SECRET, async (err, user) => {
    if (err) {
      console.log(err);
      return res.status(403).send(err.message);
    }
    const userPayload = user as { _id: string; time: Date };
    try {
      const user = await UserModel.findById({ _id: userPayload._id });
      if (user == null) return res.status(403).send("Invalid request");
      if (!user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
        user.refreshTokens = []; // invalidate all user tokens
        await user.save();
        return res.status(403).send("Invalid request");
      }
      const newPayload = { _id: user._id, time: new Date() };
      const newAccessToken = jwt.sign(newPayload, JWT_ACCESS_SECRET, { expiresIn: JWT_EXPIRATION });
      const newRefreshToken = jwt.sign(newPayload, JWT_REFRESH_SECRET);

      user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
      user.refreshTokens.push(newRefreshToken);
      await user.save();

      const tokens: ITokens = {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
      const newAuth: IAuth = {
        userId: user._id,
        fullName: user.fullName,
        plan: user.plan,
        email: user.email,
        imageUrl: user.imageUrl,
        tokens,
      };
      return res.status(200).send(newAuth);
    } catch (error) {
      console.log("Refresh tokens error: ", error);
      res.status(403).send(error.message);
    }
  });
}

async function getGoolgeUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  try {
    const res = await axios.get(GOOGLE_USER_INFO_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const googleUserInfo: GoogleUserInfo = res.data;
    return googleUserInfo;
  } catch (error) {
    throw error;
  }
}

export default {
  register,
  login,
  googleSignin,
  logout,
  refreshToken,
};
