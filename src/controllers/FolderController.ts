import { Response } from "express";
import { BaseController } from "./BaseController";
import FolderModel, { IFolder } from "../models/FolderModel";
import { AuthRequest } from "./AuthController";

class FolderController extends BaseController<IFolder> {
  constructor() {
    super(FolderModel);
  }

  async createFolder(req: AuthRequest, res: Response) {
    const { name, isPrivate, sharedWith } = req.body;
    const userId = req.user._id;

    try {
      const folder: IFolder = {
        name,
        userId,
        isPrivate,
        totalSize:0,
        status:"not-summarized",
        filesId: [],
        sharedWith: isPrivate ? [] : sharedWith,
        createdAt: new Date(),
      };

      await FolderModel.create(folder);
      return res.status(201).send(folder);
    } catch (error) {
      console.error("Error creating folder:", error);
      return res.status(500).send("Internal server error.");
    }
  }

  async getUserFolders(req: AuthRequest, res: Response) {
    const userId = req.user._id;

    try {
      const folders: IFolder[] = await FolderModel.find({
        $or: [{ userId }, { sharedWith: { $in: [userId] } }],
      });

      return res.status(200).send(folders);
    } catch (error) {
      console.error("Error fetching folders:", error);
      return res.status(500).send("Internal server error.");
    }
  }

  async updateFolder(req: AuthRequest, res: Response) {
    const folderId = req.params.id;
    const { name, isPrivate, sharedWith } = req.body;
    const userId = req.user._id;

    try {
      const folder = await FolderModel.findOneAndUpdate({ _id: folderId, ownerId: userId }, { name, isPrivate, sharedWith: isPrivate ? [] : sharedWith }, { new: true });

      if (!folder) {
        return res.status(404).send("Folder not found or you don't have permission to update it.");
      }

      return res.status(200).send(folder);
    } catch (error) {
      console.error("Error updating folder:", error);
      return res.status(500).send("Internal server error.");
    }
  }

  async deleteFolder(req: AuthRequest, res: Response) {
    const folderId = req.params.id;
    const userId = req.user._id;

    try {
      const folder = await FolderModel.findOneAndDelete({
        _id: folderId,
        ownerId: userId,
      });

      if (!folder) {
        return res.status(404).send("Folder not found or you don't have permission to delete it.");
      }

      return res.status(200).send();
    } catch (error) {
      console.error("Error deleting folder:", error);
      return res.status(500).send("Internal server error.");
    }
  }
}

export default new FolderController();
