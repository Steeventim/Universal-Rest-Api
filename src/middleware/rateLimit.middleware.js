export const rateLimitMiddleware = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 100,
    message = "Too many requests from this IP, please try again later.",
  } = options;

  const clients = new Map();

  return (req, res, next) => {
    const clientIp = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!clients.has(clientIp)) {
      clients.set(clientIp, {
        requests: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    const client = clients.get(clientIp);

    if (now > client.resetTime) {
      // Reset the window
      client.requests = 1;
      client.resetTime = now + windowMs;
      return next();
    }

    if (client.requests >= maxRequests) {
      return res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil((client.resetTime - now) / 1000),
      });
    }

    client.requests++;
    next();
  };
};

export const corsMiddleware = (options = {}) => {
  const {
    origin = "*",
    methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders = ["Content-Type", "Authorization", "X-API-Key"],
  } = options;

  return (req, res, next) => {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Methods", methods.join(", "));
    res.header("Access-Control-Allow-Headers", allowedHeaders.join(", "));

    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }

    next();
  };
};

export const loggerMiddleware = (req, res, next) => {
  const start = Date.now();
  const { method, url, ip } = req;

  res.on("finish", () => {
    const duration = Date.now() - start;
    const { statusCode } = res;

    console.log(
      `${new Date().toISOString()} - ${method} ${url} - ${statusCode} - ${duration}ms - ${ip}`
    );
  });

  next();
};
