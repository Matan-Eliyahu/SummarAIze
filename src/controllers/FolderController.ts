import { Response } from "express";
import path from "path";
import fs from "fs";
import { BaseController } from "./BaseController";
import FolderModel, { IFolder } from "../models/FolderModel";
import { AuthRequest } from "./AuthController";
import FileModel, { FileStatus, IFile } from "../models/FileModel";
import { UPLOADS_PATH } from "../common/multer";
import TextService from "../services/TextService";

class FolderController extends BaseController<IFolder> {
  constructor() {
    super(FolderModel);
  }

  async createFolder(req: AuthRequest, res: Response) {
    const { name, isPrivate, sharedWith, description } = req.body;
    const userId = req.user._id;

    const sanitizedSharedWith = Array.isArray(sharedWith) ? sharedWith : [];

    try {
      const folder: IFolder = {
        name,
        userId,
        isPrivate,
        description,
        totalSize: 0,
        status: "not-summarized",
        filesId: [],
        sharedWith: isPrivate ? [] : sanitizedSharedWith,
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
    const query = (req.query.query as string) || "";

    try {
      const folders: IFolder[] = await FolderModel.find({
        $or: [{ userId }, { sharedWith: [userId] }],
      }).lean();

      const folderIds = folders.map((folder) => folder._id);
      const folderFiles = await FileModel.find({ _id: { $in: folderIds.flatMap((id) => folders.find((folder) => folder._id === id)!.filesId) } }).lean();

      // Update each folder's status in the database based on its files
      for (const folder of folders) {
        const files = folderFiles.filter((file) => folder.filesId.includes(file._id));
        const isEmpty = folder.filesId.length === 0;
        let folderStatus: FileStatus = isEmpty ? "not-summarized" : "completed";

        for (const file of files) {
          if (file.status === "error") {
            folderStatus = "error";
            break;
          } else if (file.status === "processing") {
            folderStatus = "processing";
            break;
          } else if (file.status === "not-summarized") {
            folderStatus = "not-summarized";
            break;
          }
        }

        await FolderModel.updateOne({ _id: folder._id }, { status: folderStatus });

        folder.status = folderStatus;
      }

      // Filter folders based on the query
      const lowerCaseQuery = query.toLowerCase();
      const filteredFolders = folders.filter((folder) => {
        const nameMatch = folder.name.toLowerCase().includes(lowerCaseQuery);
        const descriptionMatch = folder.description ? folder.description.toLowerCase().includes(lowerCaseQuery) : false;
        const statusMatch = folder.status.toLowerCase().includes(lowerCaseQuery);

        return nameMatch || descriptionMatch || statusMatch;
      });

      return res.status(200).send(filteredFolders);
    } catch (error) {
      console.error("Error fetching folders:", error);
      return res.status(500).send("Internal server error.");
    }
  }

  async getFolderById(req: AuthRequest, res: Response) {
    try {
      const folderId = req.params.folderId;

      const folder = await this.model.findById(folderId);
      if (!folder) {
        return res.status(404).send("Folder not found");
      }

      const folderFiles = await FileModel.find({ _id: { $in: folder.filesId } });
      const isEmpty = folder.filesId.length === 0;
      let folderStatus: FileStatus = isEmpty ? "not-summarized" : "completed";
      for (const file of folderFiles) {
        if (file.status === "error") {
          folderStatus = "error";
          break;
        } else if (file.status === "processing") {
          folderStatus = "processing";
          break;
        } else if (file.status === "not-summarized") {
          folderStatus = "not-summarized";
          break;
        }
      }

      folder.status = folderStatus;
      await folder.save();

      return res.status(200).send(folder);
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
  }

  async updateFolderById(req: AuthRequest, res: Response) {
    const folderId = req.params.folderId;
    const { name, isPrivate, sharedWith } = req.body;
    const userId = req.user._id;

    try {
      const folder = await FolderModel.findById(folderId);

      if (!folder) {
        return res.status(404).send("Folder not found.");
      }

      if (folder.userId !== userId && !folder.sharedWith.includes(userId)) {
        return res.status(403).send("You don't have permission to update this folder.");
      }

      folder.name = name;
      folder.isPrivate = isPrivate;
      folder.sharedWith = isPrivate ? [] : sharedWith;

      await folder.save();

      return res.status(200).send(folder);
    } catch (error) {
      console.error("Error updating folder:", error);
      return res.status(500).send("Internal server error.");
    }
  }

  async deleteFolderById(req: AuthRequest, res: Response) {
    const folderId = req.params.folderId;

    try {
      const folder = await this.model.findById(folderId);
      if (!folder) {
        return res.status(404).send("Folder not found");
      }

      for (const fileId of folder.filesId) {
        const file = await FileModel.findById(fileId);
        if (file) {
          const filePath = path.join(UPLOADS_PATH, file.path);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          } else {
            console.warn(`File ${filePath} does not exist`);
          }
          await FileModel.deleteOne({ _id: fileId });
        }
      }

      await this.model.deleteOne({ _id: folderId });

      return res.status(204).send();
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
  }

  async deleteMultipleFoldersById(req: AuthRequest, res: Response) {
    const foldersId = req.body.foldersId as string[];

    if (!Array.isArray(foldersId) || foldersId.length === 0) {
      return res.status(400).send("No folder IDs provided");
    }

    try {
      for (const folderId of foldersId) {
        const folder = await this.model.findById({ _id: folderId });
        if (!folder) {
          console.warn(`Folder with ID ${folderId} not found`);
          continue; // Skip to the next folder if this one is not found
        }

        for (const fileId of folder.filesId) {
          const file = await FileModel.findById(fileId);
          if (file) {
            const filePath = path.join(UPLOADS_PATH, file.path);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            } else {
              console.warn(`File ${filePath} does not exist`);
            }
            await FileModel.deleteOne({ _id: fileId });
          }
        }

        await this.model.deleteOne({ _id: folderId });
      }

      return res.status(204).send();
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
  }

  async smartSearch(req: AuthRequest, res: Response) {
    const folderId = req.params.folderId;
    const query = req.query.query as string;

    if (!query || query.trim().length === 0) {
      return res.status(400).send("Query parameter is required.");
    }

    try {
      const folder = await this.model.findById(folderId);
      if (!folder) {
        return res.status(404).send("Folder not found.");
      }

      const folderFiles: IFile[] = await FileModel.find({ _id: { $in: folder.filesId } }).lean();

      if (folderFiles.length === 0) {
        return res.status(200).send([]);
      }

      const matchedFiles = await TextService.searchInFolder(folderFiles, query);

      return res.status(200).json(matchedFiles);
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
  }
}

export default new FolderController();
