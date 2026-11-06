import { DataTypes } from "sequelize";
import sequelize from "../../database/sequelize.js";

const Account = sequelize.define(
  "Account",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notBlank(value) {
          if (typeof value !== "string" || value.trim().length === 0) {
            throw new Error("Account name is required");
          }
        },
        len: {
          args: [1, 100],
          msg: "Account name must be between 1 and 100 characters",
        },
      },
    },

    balance: {
      type: DataTypes.DECIMAL(19, 2),
      allowNull: false,
      defaultValue: "0.00",
      validate: {
        min: {
          args: [0],
          msg: "Account balance cannot be negative",
        },
      },
    },
  },
  {
    tableName: "accounts",
    timestamps: true,
    underscored: true,
  }
);

export default Account;
