import Account from "../modules/accounts/account.model.js";
import Transaction from "../modules/transactions/transaction.model.js";
import Transfer from "../modules/transfers/transfer.model.js";

Account.hasMany(Transaction, {
  foreignKey: "accountId",
  as: "transactions",
});

Transaction.belongsTo(Account, {
  foreignKey: "accountId",
  as: "account",
});

Account.hasMany(Transfer, {
  foreignKey: "sourceAccountId",
  as: "outgoingTransfers",
});

Account.hasMany(Transfer, {
  foreignKey: "destinationAccountId",
  as: "incomingTransfers",
});

Transfer.belongsTo(Account, {
  foreignKey: "sourceAccountId",
  as: "sourceAccount",
});

Transfer.belongsTo(Account, {
  foreignKey: "destinationAccountId",
  as: "destinationAccount",
});

Transfer.hasMany(Transaction, {
  foreignKey: "transferId",
  as: "transactions",
});

Transaction.belongsTo(Transfer, {
  foreignKey: "transferId",
  as: "transfer",
});

export { Account, Transaction, Transfer };
