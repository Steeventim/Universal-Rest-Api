import Fastify from "fastify";
import { swaggerConfig } from "../../swagger/swagger.config.js";
import ItemsController from "../../controllers/items.controller.js";
import {
  createItemSchema,
  updateItemSchema,
} from "../../schemas/items.schema.js";

export class FastifyAdapter {
  constructor() {
    this.app = Fastify({
      logger: true,
    });
    this.itemsController = new ItemsController();
    this.configureMiddleware();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  async initialize() {
    await this.configureSwagger();
  }

  configureMiddleware() {
    // Support JSON
    this.app.addContentTypeParser(
      "application/json",
      { parseAs: "string" },
      (req, body, done) => {
        try {
          const json = JSON.parse(body);
          done(null, json);
        } catch (err) {
          err.statusCode = 400;
          done(err, undefined);
        }
      }
    );
  }

  configureRoutes() {
    // Wrapper pour adapter les méthodes Express vers Fastify
    const wrapController = (controllerMethod) => {
      return async (request, reply) => {
        // Mock des objets req/res d'Express pour le contrôleur
        const req = {
          params: request.params,
          body: request.body,
          query: request.query,
          headers: request.headers,
        };

        const res = {
          status: (code) => {
            reply.code(code);
            return res;
          },
          json: (data) => {
            return reply.send(data);
          },
        };

        try {
          await controllerMethod.call(this.itemsController, req, res);
        } catch (error) {
          reply.code(500).send({
            success: false,
            message: error.message,
          });
        }
      };
    };

    // Routes pour les items avec les vrais contrôleurs
    this.app.get("/api/items", wrapController(this.itemsController.getItems));
    this.app.get(
      "/api/items/:id",
      wrapController(this.itemsController.getItem)
    );
    this.app.post(
      "/api/items",
      wrapController(this.itemsController.createItem)
    );
    this.app.put(
      "/api/items/:id",
      wrapController(this.itemsController.updateItem)
    );
    this.app.delete(
      "/api/items/:id",
      wrapController(this.itemsController.deleteItem)
    );
  }

  async configureSwagger() {
    // Register Fastify Swagger
    const fastifySwagger = await import("@fastify/swagger");
    await this.app.register(fastifySwagger.default, {
      openapi: swaggerConfig,
    });

    // Register Fastify Swagger UI
    const fastifySwaggerUI = await import("@fastify/swagger-ui");
    await this.app.register(fastifySwaggerUI.default, {
      routePrefix: "/docs",
      uiConfig: {
        docExpansion: "full",
        deepLinking: false,
      },
    });
  }

  configureErrorHandling() {
    this.app.setErrorHandler((error, request, reply) => {
      console.error(error);
      reply.status(error.statusCode || 500).send({
        success: false,
        message: error.message || "Internal server error",
      });
    });

    this.app.setNotFoundHandler((request, reply) => {
      reply.code(404).send({
        success: false,
        message: "Route not found",
      });
    });
  }

  async listen(port, callback) {
    try {
      await this.initialize(); // Initialize Swagger before listening
      await this.app.listen({ port, host: "0.0.0.0" });
      if (callback) callback();
    } catch (err) {
      this.app.log.error(err);
      process.exit(1);
    }
  }
}
