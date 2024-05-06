import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User, { IUser } from "../models/userModel";
import jwt from "jsonwebtoken";
import { Document } from "mongoose";

const register = async (req: Request, res: Response) => {
  const email = req.body.email;
  const password = req.body.password;
  const fullName = req.body.fullName;
  try {
    const rs = await User.findOne({ email: email });
    if (rs != null) {
      return res.status(406).send("email already exists");
    }
    const rs2 = await User.create({
      email: email,
      password: password,
      fullName: fullName,
    });
    const tokens = await generateTokens(rs2);
    res.status(201).send({
      email: rs2.email,
      _id: rs2._id,
      ...tokens,
    });
  } catch (err) {
    return res.status(400).send(err.message);
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
    return res.status(200).send(tokens);
  } catch (err) {
    return res.status(400).send("error missing email or password");
  }
};

export default {
  register,
  login,
};
