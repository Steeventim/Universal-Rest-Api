import { Router } from "express";
import itemsRoutes from "./items.routes.js";

const router = Router();

export const setRoutes = (app) => {
  app.use("/api/items", itemsRoutes);
};

export default router;
