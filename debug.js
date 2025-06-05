// Debug script to identify the problem
console.log("Starting debug...");

try {
  console.log("1. Testing environment config...");
  const { config } = await import('./src/config/environment.js');
  console.log("✅ Environment config loaded:", config.framework, config.port);

  console.log("2. Testing middleware...");
  const middleware = await import('./src/middleware/rateLimit.middleware.js');
  console.log("✅ Middleware loaded");

  console.log("3. Testing Express adapter...");
  const { ExpressAdapter } = await import('./src/framework/express/adapter.js');
  console.log("✅ Express adapter loaded");

  console.log("4. Creating Express adapter instance...");
  const adapter = new ExpressAdapter();
  console.log("✅ Express adapter created");

  console.log("5. Testing listen...");
  const server = adapter.listen(3002, () => {
    console.log("✅ Server started successfully on port 3002");
    server.close();
  });

} catch (error) {
  console.error("❌ Error:", error.message);
  console.error("Stack:", error.stack);
}
