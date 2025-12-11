import { DataTypes, Model, type Optional } from "sequelize"
import sequelize from "../database/connection"

interface JobAttributes {
  id: number
  taskName: string
  payload: object | null
  priority: "Low" | "Medium" | "High"
  status: "pending" | "running" | "completed" | "failed"
  attempts: number
  lastError: string | null
  createdAt: Date
  updatedAt: Date
  startedAt: Date | null
  completedAt: Date | null
  runDurationMs: number | null
}

type JobOptionalFields =
  | "id"
  | "createdAt"
  | "updatedAt"
  | "priority"
  | "status"
  | "attempts"
  | "lastError"
  | "payload"
  | "startedAt"
  | "completedAt"
  | "runDurationMs"

interface JobCreationAttributes extends Optional<JobAttributes, JobOptionalFields> {}

class Job extends Model<JobAttributes, JobCreationAttributes> implements JobAttributes {
  declare id: number
  declare taskName: string
  declare payload: object | null
  declare priority: "Low" | "Medium" | "High"
  declare status: "pending" | "running" | "completed" | "failed"
  declare attempts: number
  declare lastError: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare startedAt: Date | null
  declare completedAt: Date | null
  declare runDurationMs: number | null
}

Job.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    taskName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    payload: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    priority: {
      type: DataTypes.ENUM("Low", "Medium", "High"),
      allowNull: false,
      defaultValue: "Low",
    },
    status: {
      type: DataTypes.ENUM("pending", "running", "completed", "failed"),
      allowNull: false,
      defaultValue: "pending",
    },
    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    lastError: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    runDurationMs: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "jobs",
    timestamps: true,
    indexes: [{ fields: ["status"] }, { fields: ["priority"] }, { fields: ["createdAt"] }],
  },
)

export default Job
