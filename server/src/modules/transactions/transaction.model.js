import { DataTypes } from "sequelize";
import sequelize from "../../database/sequelize.js";

const Transaction = sequelize.define(
  "Transaction",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },

    transferId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: "transfer_id",
   },

    accountId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "account_id",
    },

    description: {
    type: DataTypes.STRING(255),
    allowNull: true,
    },

    type: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: {
      isIn: {
        args: [["credit", "debit"]],
        msg: "Transaction type must be credit or debit",
      },
     },
    },

    amount: {
      type: DataTypes.DECIMAL(19, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0.01],
          msg: "Transaction amount must be greater than zero",
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
            throw new Error("Reference ID is required");
          }
        },
      },
    },
  },
  {
    tableName: "transactions",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: false,
    underscored: true,
  }
);

export default Transaction;
