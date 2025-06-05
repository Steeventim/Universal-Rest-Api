import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  framework: process.env.FRAMEWORK || "express",
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl:
    process.env.DATABASE_URL || "mongodb://localhost:27017/mydatabase",
  jwtSecret: process.env.JWT_SECRET || "your_jwt_secret",
  apiKey: process.env.API_KEY || "your_api_key",
  // CORS Settings
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || "900000",
  RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS || "100",
  // Node Environment
  NODE_ENV: process.env.NODE_ENV || "development",
};
