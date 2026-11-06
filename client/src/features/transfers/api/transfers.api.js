import api from "../../../lib/axios.js";

export const transfersApi = {
  create: async (transferData) => {
    const response = await api.post("/api/transfers", transferData);
    return response.data;
  },
};
