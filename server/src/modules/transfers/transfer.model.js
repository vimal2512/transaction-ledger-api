import { DataTypes } from "sequelize";
import sequelize from "../../database/sequelize.js";

const Transfer = sequelize.define(
  "Transfer",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },

    sourceAccountId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "source_account_id",
    },

    destinationAccountId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "destination_account_id",
    },

    amount: {
      type: DataTypes.DECIMAL(19, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0.01],
          msg: "Transfer amount must be greater than zero",
        },
      },
    },

    referenceId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "reference_id",
      validate: {
        notBlank(value) {
          if (typeof value !== "string" || value.trim().length === 0) {
            throw new Error("Transfer reference ID is required");
          }
        },
      },
    },
  },
  {
    tableName: "transfers",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: false,
    underscored: true,
  }
);

export default Transfer;
