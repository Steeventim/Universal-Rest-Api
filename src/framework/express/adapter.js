import express from "express";
import swaggerUi from "swagger-ui-express";
import { setRoutes } from "../../routes/index.js";
import { swaggerConfig } from "../../swagger/swagger.config.js";
import {
  rateLimitMiddleware,
  corsMiddleware,
  loggerMiddleware,
} from "../../middleware/rateLimit.middleware.js";
import { environment } from "../../config/environment.js";

export class ExpressAdapter {
  constructor() {
    this.app = express();
    this.configureMiddleware();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  configureMiddleware() {
    // Trust proxy for rate limiting and IP detection
    this.app.set("trust proxy", 1);

    // CORS middleware
    this.app.use(
      corsMiddleware({
        origin: environment.CORS_ORIGIN || "*",
      })
    );

    // Logger middleware
    if (environment.NODE_ENV !== "test") {
      this.app.use(loggerMiddleware);
    }

    // Rate limiting middleware
    this.app.use(
      rateLimitMiddleware({
        windowMs: parseInt(environment.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
        maxRequests: parseInt(environment.RATE_LIMIT_MAX_REQUESTS) || 100,
      })
    );

    // Body parsing middleware
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  configureRoutes() {
    // Documentation Swagger
    this.app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerConfig));

    // Routes de l'API
    setRoutes(this.app);
  }

  configureErrorHandling() {
    // Middleware de gestion d'erreurs
    this.app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error",
      });
    });

    // Route 404
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: "Route not found",
      });
    });
  }

  listen(port, callback) {
    return this.app.listen(port, callback);
  }
}
