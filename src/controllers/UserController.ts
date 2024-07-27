import { BaseController } from "./BaseController";
import UserModel, { IUser } from "../models/UserModel";
import { Response } from "express";
import { AuthRequest } from "./AuthController";
import { PlanType } from "../common/types";

class UserController extends BaseController<IUser> {
  constructor() {
    super(UserModel);
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
