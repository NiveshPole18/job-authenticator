import { DataTypes, Model, type Optional } from "sequelize"
import sequelize from "../database/connection"

interface WebhookLogAttributes {
  id: number
  jobId: number
  url: string
  requestBody: object
  responseStatus: number | null
  responseBody: string | null
  attempt: number
  error: string | null
  createdAt: Date
}

interface WebhookLogCreationAttributes extends Optional<WebhookLogAttributes, "id" | "createdAt"> {}

class WebhookLog extends Model<WebhookLogAttributes, WebhookLogCreationAttributes> implements WebhookLogAttributes {
  declare id: number
  declare jobId: number
  declare url: string
  declare requestBody: object
  declare responseStatus: number | null
  declare responseBody: string | null
  declare attempt: number
  declare error: string | null
  declare createdAt: Date
}

WebhookLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    jobId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "jobs",
        key: "id",
      },
    },
    url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    requestBody: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    responseStatus: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    responseBody: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    attempt: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    error: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "webhook_logs",
    timestamps: false,
    indexes: [{ fields: ["jobId"] }, { fields: ["createdAt"] }],
  },
)

export default WebhookLog
