import api from "../../../lib/axios.js";

export const accountsApi = {
  getAll: async (page = 1, limit = 10) => {
  const response = await api.get("/api/accounts", {
    params: { page, limit },
  });

  return response.data;
},

  getById: async (accountId) => {
    const response = await api.get(`/api/accounts/${accountId}`);
    return response.data;
  },

  getSummary: async () => {
  const response = await api.get("/api/accounts/summary");
  return response.data;
},


getAllForTransfer: async () => {
  const response = await api.get("/api/accounts/all");
  return response.data;
},


  create: async (accountData) => {
    const response = await api.post("/api/accounts", accountData);
    return response.data;
  },
};
