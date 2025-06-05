import { Router } from "express";
import ItemsController from "../controllers/items.controller.js";

const router = Router();
const itemsController = new ItemsController();

router.get("/", itemsController.getItems.bind(itemsController));
router.get("/:id", itemsController.getItem.bind(itemsController));
router.post("/", itemsController.createItem.bind(itemsController));
router.put("/:id", itemsController.updateItem.bind(itemsController));
router.delete("/:id", itemsController.deleteItem.bind(itemsController));

export default router;
