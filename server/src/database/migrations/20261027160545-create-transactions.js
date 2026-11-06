"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("transactions", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      account_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "accounts",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      type: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },

      amount: {
        type: Sequelize.DECIMAL(19, 2),
        allowNull: false,
      },

      reference_id: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE transactions
      ADD CONSTRAINT transactions_type_valid
      CHECK (type IN ('credit', 'debit'))
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE transactions
      ADD CONSTRAINT transactions_amount_positive
      CHECK (amount > 0)
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE transactions
      ADD CONSTRAINT transactions_reference_nonblank
      CHECK (length(trim(reference_id)) > 0)
    `);

    await queryInterface.addConstraint("transactions", {
      fields: ["account_id", "reference_id"],
      type: "unique",
      name: "transactions_account_reference_unique",
    });

    await queryInterface.addIndex("transactions", [
      "account_id",
      "created_at",
      "id",
    ], {
      name: "transactions_account_history_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("transactions");
  },
};
