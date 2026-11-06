import { useQuery } from "@tanstack/react-query";
import { accountsApi } from "../api/accounts.api.js";

export function useAccountSummary() {
  return useQuery({
    queryKey: ["account-summary"],
    queryFn: accountsApi.getSummary,
  });
}
