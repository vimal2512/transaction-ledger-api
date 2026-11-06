import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ReceiptText,
  RefreshCw,
} from "lucide-react";
import { transactionsApi } from "../api/transactions.api.js";

function formatCurrency(amount) {
  return `₹${Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(date) {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const {
    data: response,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["all-transactions", page, limit],
    queryFn: () => transactionsApi.getAll(page, limit),
    placeholderData: (previousData) => previousData,
  });

  const data = response?.data;
  const transactions = data?.transactions ?? [];
  const pagination = data?.pagination;

  function handleLimitChange(event) {
    setLimit(Number(event.target.value));
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Transactions
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            View credit, debit, and transfer transactions across all accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={isFetching ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:p-6">
          <div>
            <h2 className="font-semibold text-gray-900">
              All Transactions
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {pagination
                ? `${pagination.totalRecords} transaction${pagination.totalRecords === 1 ? "" : "s"} found`
                : "Transactions from every account"}
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600">
            Rows per page
            <select
              value={limit}
              onChange={handleLimitChange}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-sm text-gray-500">
            Loading transactions...
          </div>
        ) : isError ? (
          <div
            role="alert"
            className="p-8 text-center"
          >
            <p className="font-medium text-red-600">
              Unable to load transactions
            </p>
            <p className="mt-2 text-sm text-gray-500">
              {error?.response?.data?.message ||
                "Please check your connection and try again."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Try again
            </button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center">
            <ReceiptText
              size={36}
              className="mx-auto text-gray-400"
            />
            <p className="mt-3 font-medium text-gray-900">
              No transactions found
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Transactions will appear here when they are created.
            </p>
          </div>
        ) : (
          <>
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-4 font-medium">Transaction</th>
                    <th className="px-5 py-4 font-medium">Account</th>
                    <th className="px-5 py-4 font-medium">Reference ID</th>
                    <th className="px-5 py-4 font-medium">Date</th>
                    <th className="px-5 py-4 text-right font-medium">Amount</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {transactions.map((transaction) => {
                    const isCredit = transaction.type === "credit";

                    return (
                      <tr
                        key={transaction.id}
                        className="transition hover:bg-gray-50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`rounded-lg p-2 ${
                                isCredit
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "bg-red-50 text-red-600"
                              }`}
                            >
                              {isCredit ? (
                                <ArrowDownLeft size={18} />
                              ) : (
                                <ArrowUpRight size={18} />
                              )}
                            </div>

                            <div>
                              <p className="font-medium capitalize text-gray-900">
                                {transaction.type}
                              </p>
                              <p
                                className="mt-1 max-w-[200px] truncate text-xs text-gray-500"
                                title={transaction.description || "No description"}
                              >
                                {transaction.description || "No description"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-medium text-gray-900">
                            {transaction.accountName || "Unknown account"}
                          </p>
                          <p
                            className="mt-1 max-w-[190px] truncate text-xs text-gray-500"
                            title={transaction.accountId}
                          >
                            {transaction.accountId}
                          </p>
                        </td>

                        <td
                          className="max-w-[200px] truncate px-5 py-4 text-gray-500"
                          title={transaction.referenceId}
                        >
                          {transaction.referenceId}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-gray-500">
                          {formatDate(transaction.createdAt)}
                        </td>

                        <td
                          className={`whitespace-nowrap px-5 py-4 text-right font-semibold ${
                            isCredit ? "text-emerald-600" : "text-red-600"
                          }`}
                        >
                          {isCredit ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col justify-between gap-4 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center">
              <p className="text-sm text-gray-500">
                Page {pagination?.page ?? page} of {pagination?.totalPages ?? 0}
                {pagination
                  ? ` · ${pagination.totalRecords} total records`
                  : ""}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage((current) => current - 1)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  type="button"
                  disabled={
                    isFetching ||
                    !pagination ||
                    page >= pagination.totalPages
                  }
                  onClick={() => setPage((current) => current + 1)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default TransactionsPage;
