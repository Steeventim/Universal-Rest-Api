import { ExpressAdapter } from "./express/adapter.js";
import { FastifyAdapter } from "./fastify/adapter.js";
import { config } from "../config/environment.js";

export class FrameworkFactory {
  static create(framework = config.framework) {
    switch (framework.toLowerCase()) {
      case "express":
        return new ExpressAdapter();
      case "fastify":
        return new FastifyAdapter();
      default:
        throw new Error(`Framework ${framework} not supported`);
    }
  }
}
