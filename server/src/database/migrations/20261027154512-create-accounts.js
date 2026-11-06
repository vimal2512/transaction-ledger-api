export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("accounts", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },

    name: {
      type: Sequelize.STRING(100),
      allowNull: false,
    },

    balance: {
      type: Sequelize.DECIMAL(19, 2),
      allowNull: false,
      defaultValue: "0.00",
    },

    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },

    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });

  await queryInterface.sequelize.query(`
    ALTER TABLE accounts
    ADD CONSTRAINT accounts_balance_nonnegative
    CHECK (balance >= 0)
  `);

  await queryInterface.sequelize.query(`
    ALTER TABLE accounts
    ADD CONSTRAINT accounts_name_nonblank
    CHECK (length(trim(name)) > 0)
  `);
}

export async function down(queryInterface) {
  await queryInterface.dropTable("accounts");
}
