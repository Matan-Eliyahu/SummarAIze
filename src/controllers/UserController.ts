import { BaseController } from "./BaseController";
import UserModel, { hashPassword, IAccount, IUser, IUserSearchResult } from "../models/UserModel";
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
        registrationMethod: user.registrationMethod,
        _id: user._id?.toString(),
      };
      return res.status(200).send(account);
    } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(500).send("Internal server error.");
    }
  }

  async searchUsers(req: AuthRequest, res: Response) {
    const userId = req.user._id;
    try {
      const { query } = req.query;

      if (!query) {
        return res.status(400).send("Query parameter is required");
      }

      const users: IUserSearchResult[] = await UserModel.find(
        {
          _id: { $ne: userId },
          $or: [{ fullName: new RegExp(query as string, "i") }, { email: new RegExp(query as string, "i") }],
        },
        "fullName email imageUrl _id"
      ).lean();

      return res.status(200).send(users);
    } catch (error) {
      return res.status(500).send("Internal server error.");
    }
  }

  async updateUser(req: AuthRequest, res: Response) {
    const userId = req.user._id;
    const updatedUser: IUser = req.body;
    const { password, ...otherFields } = updatedUser;
    try {
      let user: IUser;
      // Check if password is provided and needs to be updated
      if (password && password.trim() !== "") {
        const hashedPassword = await hashPassword(password);
        updatedUser.password = hashedPassword;
        user = await UserModel.findByIdAndUpdate(userId, updatedUser, { new: true });
      } else {
        // Update the user document with the provided fields
        user = await UserModel.findByIdAndUpdate(userId, { ...otherFields }, { new: true });
      }

      if (!user) {
        return res.status(404).send("User not found.");
      }

      const account: IAccount = {
        fullName: user.fullName,
        email: user.email,
        plan: user.plan,
        imageUrl: user.imageUrl,
        registrationMethod: user.registrationMethod,
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
