import { Request, Response } from "express";
import SettingsModel, { ISettings } from "../models/SettingsModel";
import { BaseController } from "./BaseController";
import { AuthRequest } from "./AuthController";

class SettingsController extends BaseController<ISettings> {
  constructor() {
    super(SettingsModel);
  }

  async getSettingsByUserId(req: AuthRequest, res: Response) {
    try {
      const userId = req.user._id;
      const settings = await this.model.findOne({ userId });
      if (!settings) {
        return res.status(404).send("Settings not found");
      }
      return res.send(settings);
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
  }

  async updateSettingsByUserId(req: AuthRequest, res: Response) {
    try {
      const userId = req.user._id;
      const updatedSettings = await this.model.findOneAndUpdate({ userId }, req.body, { new: true });
      if (!updatedSettings) {
        return res.status(404).send("Settings not found");
      }
      return res.status(200).send(updatedSettings);
    } catch (error) {
      console.error(error);
      return res.status(500).send("Internal Server Error");
    }
  }
}


export default new SettingsController();
