const fastify = require('fastify')({ logger: true });
const { setRoutes } = require('../../routes');
const swaggerConfig = require('../../swagger/swagger.config');

// Swagger documentation setup
fastify.register(require('fastify-swagger'), swaggerConfig);

// Middleware setup
fastify.addHook('onRequest', async (request, reply) => {
    // Add any global middleware here
});

// Set up routes
setRoutes(fastify);

// Start the server
const start = async () => {
    try {
        await fastify.listen(process.env.PORT || 3000);
        fastify.log.info(`Server listening on ${fastify.server.address().port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();