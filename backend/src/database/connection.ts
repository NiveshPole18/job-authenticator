import { Sequelize } from "sequelize"
import dotenv from "dotenv"

dotenv.config()

// Support both DATABASE_URL (Render format) and individual variables
let sequelize: Sequelize

// Configure Sequelize with lazy connection (doesn't connect until first query)
const sequelizeConfig = {
  dialect: "mysql" as const,
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  dialectOptions: {
    connectTimeout: 30000, // 30 seconds (reduced from 60 for faster failure)
    // Enable SSL if using Render's database
    ssl: process.env.NODE_ENV === "production" ? {
      rejectUnauthorized: false, // Render uses self-signed certs
    } : undefined,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000, // 30 seconds
    idle: 10000,
  },
  // Don't connect on initialization
  retry: {
    max: 3,
    match: [
      /ETIMEDOUT/,
      /EHOSTUNREACH/,
      /ECONNREFUSED/,
      /ETIMEDOUT/,
      /ESOCKETTIMEDOUT/,
      /EHOSTUNREACH/,
      /EPIPE/,
      /EAI_AGAIN/,
      /ENOTFOUND/,
      /ECONNRESET/,
      /ECONNREFUSED/,
      /ETIMEDOUT/,
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/,
    ],
  },
}

if (process.env.DATABASE_URL) {
  // Render provides DATABASE_URL format: mysql://user:password@host:port/database
  // Parse and use DATABASE_URL
  sequelize = new Sequelize(process.env.DATABASE_URL, sequelizeConfig)
} else {
  // Fallback to individual environment variables
  sequelize = new Sequelize(
    process.env.DB_NAME || "jobsdb",
    process.env.DB_USER || "root",
    process.env.DB_PASSWORD || "password",
    {
      ...sequelizeConfig,
      host: process.env.DB_HOST || "localhost",
      port: Number.parseInt(process.env.DB_PORT || "3306"),
    },
  )
}

export default sequelize
