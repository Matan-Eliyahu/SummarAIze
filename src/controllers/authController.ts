import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User, { IUser } from "../models/UserModel";
import jwt from "jsonwebtoken";
import { Document } from "mongoose";
import { IAuth } from "../common/types";

const register = async (req: Request, res: Response) => {
  const userData: IUser = req.body;
  try {
    const findUser = await User.findOne({ email: userData.email });
    if (findUser) {
      return res.status(406).send("email already exists");
    }
    const user = await User.create(userData);
    res.status(201).send(user._id);
  } catch (error) {
    console.log("Registration error: ", error);
    return res.status(400).send(error.message);
  }
};

const generateTokens = async (user: Document & IUser) => {
  const accessToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
  const refreshToken = jwt.sign({ _id: user._id }, process.env.JWT_REFRESH_SECRET);
  if (user.refreshTokens == null) {
    user.refreshTokens = [refreshToken];
  } else {
    user.refreshTokens.push(refreshToken);
  }
  await user.save();
  return {
    userId: user._id,
    accessToken: accessToken,
    refreshToken: refreshToken,
  };
};

const login = async (req: Request, res: Response) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send("missing email or password");
  }
  try {
    const user = await User.findOne({ email: email });
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
      ...tokens,
    };
    return res.status(200).send(auth);
  } catch (err) {
    return res.status(400).send("error missing email or password");
  }
};

async function logout(req: Request, res: Response) {
  const authHeader = req.headers["authorization"];
  const refreshToken = authHeader && authHeader.split(" ")[1]; // JWT <refreshToken>
  if (refreshToken == null) return res.sendStatus(401);

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, user) => {
    if (err) {
      return res.status(403).send(err.message);
    }
    const userInfo = user as { _id: string; time: Date };
    try {
      const user = await User.findById({ _id: userInfo._id });
      // if (user == null) res.status(403).send("Invalid request");
      if (!user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
        user.refreshTokens = []; // invalidate all user tokens
        await user.save();
        return res.status(403).send("Invalid request");
      } else {
        user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
        await user.save();
        return res.sendStatus(200);
      }

      // user.tokens.splice(user.tokens.indexOf(refreshToken), 1);
      // await user.save();
      // return res.sendStatus(200);
    } catch (error) {
      res.status(403).send(error.message);
    }
  });
}

export default {
  register,
  login,
  logout,
};
