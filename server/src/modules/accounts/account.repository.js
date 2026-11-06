import Account from "./account.model.js";

export const createAccount = (accountData, options = {}) => {
  return Account.create(accountData, options);
};

export const findAccountById = (id, options = {}) => {
  return Account.findByPk(id, options);
};

export const findAllAccounts = (options = {}) => {
  return Account.findAll(options);
};


export const findPaginatedAccounts = ({ limit, offset } = {}) => {
  return Account.findAndCountAll({
    limit,
    offset,
    order: [
      ["createdAt", "DESC"],
      ["id", "DESC"],
    ],
  });
};


export async function getAccountSummary() {
  return Account.findOne({
    attributes: [
      [
        Account.sequelize.fn("COUNT", Account.sequelize.col("id")),
        "totalAccounts",
      ],
      [
        Account.sequelize.fn(
          "COALESCE",
          Account.sequelize.fn(
            "SUM",
            Account.sequelize.col("balance")
          ),
          0
        ),
        "totalBalance",
      ],
    ],
    raw: true,
  });
}
