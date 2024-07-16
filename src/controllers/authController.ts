import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import UserModel, { IUser } from "../models/UserModel";
import { Document } from "mongoose";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION;

export interface AuthRequest extends Request {
  user?: { _id: string };
}
export interface IAuth {
  id: string;
  email: string;
  tokens: ITokens;
}

export interface ITokens {
  accessToken: string;
  refreshToken: string;
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

const register = async (req: Request, res: Response) => {
  const userData: IUser = req.body;
  if (!userData.email || !userData.password) {
    return res.status(400).send("Email or password is missing");
  }
  try {
    const findUser = await UserModel.findOne({ email: userData.email });
    if (findUser) {
      return res.status(406).send("Email already exists");
    }
    const user = await UserModel.create(userData);
    res.status(201).send({ _id: user._id });
  } catch (error) {
    console.log("Registration error: ", error);
    return res.status(400).send(error.message);
  }
};

async function login(req: Request, res: Response) {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send("missing email or password");
  }
  try {
    const user = await UserModel.findOne({ email: email });
    if (user == null) {
      return res.status(401).send("email or password incorrect");
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).send("email or password incorrect");
    }

    const tokens = await generateTokens(user);
    const auth: IAuth = {
      id: user._id,
      email: user.email,
      tokens,
    };
    return res.status(200).send(auth);
  } catch (err) {
    return res.status(400).send("error missing email or password");
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
      console.log(error);
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
        id: user._id,
        email: user.email,
        tokens,
      };
      return res.status(200).send(newAuth);
    } catch (error) {
      console.log(error.message);
      res.status(403).send(error.message);
    }
  });
}

export default {
  register,
  login,
  logout,
  refreshToken,
};
