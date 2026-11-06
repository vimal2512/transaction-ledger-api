import { useQuery } from "@tanstack/react-query";
import { accountsApi } from "../api/accounts.api.js";

export function useAccounts(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["accounts", page, limit],
    queryFn: () => accountsApi.getAll(page, limit),
  });
}
