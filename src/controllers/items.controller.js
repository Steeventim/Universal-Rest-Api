import ItemsService from "../services/items.service.js";
import { createItemSchema, updateItemSchema } from "../schemas/items.schema.js";

class ItemsController {
  constructor() {
    this.itemsService = new ItemsService();
  }

  async getItems(req, res) {
    try {
      const items = await this.itemsService.getAllItems();
      res.status(200).json({
        success: true,
        data: items,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error retrieving items",
        error: error.message,
      });
    }
  }

  async getItem(req, res) {
    const { id } = req.params;
    try {
      const item = await this.itemsService.getItemById(id);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Item not found",
        });
      }
      res.status(200).json({
        success: true,
        data: item,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error retrieving item",
        error: error.message,
      });
    }
  }

  async createItem(req, res) {
    try {
      const validatedData = createItemSchema.parse(req.body);
      const createdItem = await this.itemsService.createItem(validatedData);
      res.status(201).json({
        success: true,
        data: createdItem,
      });
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.errors,
        });
      }
      res.status(400).json({
        success: false,
        message: "Error creating item",
        error: error.message,
      });
    }
  }

  async updateItem(req, res) {
    const { id } = req.params;
    try {
      const validatedData = updateItemSchema.parse(req.body);
      const item = await this.itemsService.updateItem(id, validatedData);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Item not found",
        });
      }
      res.status(200).json({
        success: true,
        data: item,
      });
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.errors,
        });
      }
      res.status(500).json({
        success: false,
        message: "Error updating item",
        error: error.message,
      });
    }
  }

  async deleteItem(req, res) {
    const { id } = req.params;
    try {
      const deleted = await this.itemsService.deleteItem(id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Item not found",
        });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error deleting item",
        error: error.message,
      });
    }
  }
}

export default ItemsController;
