import { BaseController } from "./BaseController";
import UserModel, { IAccount, IUser } from "../models/UserModel";
import { Response } from "express";
import { AuthRequest } from "./AuthController";
import { PlanType } from "../common/types";

class UserController extends BaseController<IUser> {
  constructor() {
    super(UserModel);
  }

  async getUser(req: AuthRequest, res: Response) {
    const userId = req.user._id;
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).send("User not found.");
      }
      const account: IAccount = {
        fullName: user.fullName,
        email: user.email,
        plan: user.plan,
        imageUrl: user.imageUrl,
        _id: user._id?.toString(),
      };
      return res.status(200).send(account);
    } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(500).send("Internal server error.");
    }
  }

  async updateUser(req: AuthRequest, res: Response) {
    const userId = req.user._id;
    const updatedUser:IUser = req.body;

    try {
      const user = await UserModel.findByIdAndUpdate(userId, updatedUser, { new: true });
      if (!user) {
        return res.status(404).send("User not found.");
      }
      const account: IAccount = {
        fullName: user.fullName,
        email: user.email,
        plan: user.plan,
        imageUrl: user.imageUrl,
        _id: user._id?.toString(),
      };
      return res.status(200).send(account);
    } catch (error) {
      console.error("Error updating user:", error);
      return res.status(500).send("Internal server error.");
    }
  }

  async deleteUser(req: AuthRequest, res: Response) {
    const userId = req.user._id;

    try {
      const user = await UserModel.findByIdAndDelete(userId);
      if (!user) {
        return res.status(404).send("User not found.");
      }
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting user:", error);
      return res.status(500).send("Internal server error.");
    }
  }

  async updatePlan(req: AuthRequest, res: Response) {
    const userId = req.user._id;
    const newPlan: PlanType = req.body.newPlan;

    if (!userId || !newPlan) {
      return res.status(400).json("User ID and new plan are required");
    }
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).send("User not found.");
      }

      user.plan = newPlan;
      await user.save();

      return res.status(200).send(user);
    } catch (error) {
      console.error("Error updating plan:", error);
      return res.status(500).send("Internal server error.");
    }
  }
}

export default new UserController();
