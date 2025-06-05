import { FrameworkFactory } from "./framework/factory.js";
import { config } from "./config/environment.js";

const server = FrameworkFactory.create(config.framework);

server.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port}`);
  console.log(
    `📚 Swagger documentation available at http://localhost:${config.port}/docs`
  );
  console.log(`🔧 Framework: ${config.framework}`);
});
