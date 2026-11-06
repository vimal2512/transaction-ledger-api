import api from "../../../lib/axios.js";

export const transactionsApi = {
  // Get transactions across all accounts
  getAll: async (page = 1, limit = 10) => {
    const response = await api.get("/api/transactions", {
      params: { page, limit },
    });

    return response.data;
  },

  // Get transaction history for a specific account
  getByAccount: async (accountId, page = 1, limit = 10) => {
    const response = await api.get(
      `/api/accounts/${accountId}/transactions`,
      {
        params: { page, limit },
      }
    );

    return response.data;
  },

  // Create a transaction for a specific account
  create: async (accountId, transactionData) => {
    const response = await api.post(
      `/api/accounts/${accountId}/transactions`,
      transactionData
    );

    return response.data;
  },
};
