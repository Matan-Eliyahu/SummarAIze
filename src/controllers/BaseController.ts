import { Request, Response } from "express";
import { Model } from "mongoose";

export class BaseController<ModelType> {
  model: Model<ModelType>;
  constructor(model: Model<ModelType>) {
    this.model = model;
  }

  async getAll(req: Request, res: Response) {
    try {
      const items = await this.model.find();
      return res.send(items);
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  }

  async getById(req: Request, res: Response) {
    try {
      if (req.params.id) {
        const itemId = req.params.id;
        const itemById = await this.model.findById(itemId);
        return res.send(itemById);
      } else {
      }
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
  }

  async create(req: Request, res: Response) {
    try {
      const itemData = req.body;
      const newItem = await this.model.create(itemData);
      return res.status(201).send(newItem);
    } catch (err) {
      console.error(err);
      return res.status(500).send(err.message);
    }
  }

  async updateById(req: Request, res: Response) {
    try {
      const itemId = req.params.id;
      const updatedItem = await this.model.findByIdAndUpdate(itemId, req.body, {
        new: true,
      });
      if (!updatedItem) {
        return res.status(404).send("Item not found");
      }
      return res.status(200).send(updatedItem);
    } catch (error) {
      console.error(error);
      return res.status(500).send("Internal Server Error");
    }
  }

  async deleteById(req: Request, res: Response) {
    try {
      const itemId = req.params.id;
      const deletedItem = await this.model.findByIdAndDelete(itemId);
      if (!deletedItem) {
        return res.status(404).send("Comment not found");
      }
      return res.status(204).send();
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
  }
}

const createController = <ModelType>(model: Model<ModelType>) => {
  return new BaseController<ModelType>(model);
};

export default createController;
