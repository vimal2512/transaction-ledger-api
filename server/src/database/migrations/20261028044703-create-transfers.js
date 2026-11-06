"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("transfers", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      source_account_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "accounts",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      destination_account_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "accounts",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
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
      ALTER TABLE transfers
      ADD CONSTRAINT transfers_amount_positive
      CHECK (amount > 0)
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE transfers
      ADD CONSTRAINT transfers_accounts_different
      CHECK (source_account_id <> destination_account_id)
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE transfers
      ADD CONSTRAINT transfers_reference_nonblank
      CHECK (length(trim(reference_id)) > 0)
    `);

    await queryInterface.addConstraint("transfers", {
      fields: ["reference_id"],
      type: "unique",
      name: "transfers_reference_unique",
    });

    await queryInterface.addColumn("transactions", "transfer_id", {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "transfers",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    await queryInterface.addIndex(
      "transactions",
      ["transfer_id"],
      { name: "transactions_transfer_id_idx" }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      "transactions",
      "transactions_transfer_id_idx"
    );

    await queryInterface.removeColumn("transactions", "transfer_id");

    await queryInterface.dropTable("transfers");
  },
};
