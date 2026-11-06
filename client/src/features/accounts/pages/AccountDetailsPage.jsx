import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Wallet } from "lucide-react";
import { accountsApi } from "../api/accounts.api.js";
import { transactionsApi } from "../../transactions/api/transactions.api.js";
import TransactionTable from "../../transactions/components/TransactionTable.jsx";
import TransactionPagination from "../../transactions/components/TransactionPagination.jsx";

function formatCurrency(amount) {
  return `₹${Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function AccountDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 10;

  const {
    data: accountResponse,
    isLoading: accountLoading,
    isError: accountError,
    error: accountErrorDetails,
  } = useQuery({
    queryKey: ["accounts", id],
    queryFn: () => accountsApi.getById(id),
  });

  const {
    data: transactionResponse,
    isLoading: transactionsLoading,
    isError: transactionsError,
  } = useQuery({
    queryKey: ["transactions", id, page, limit],
    queryFn: () => transactionsApi.getByAccount(id, page, limit),
    placeholderData: (previousData) => previousData,
  });

  const account = accountResponse?.data;
  const transactionsData = transactionResponse?.data;
  const transactions = transactionsData?.transactions ?? [];
  const pagination = transactionsData?.pagination;

  if (accountLoading) {
    return <p className="text-gray-500">Loading account details...</p>;
  }

  if (accountError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        {accountErrorDetails?.response?.data?.message ||
          "Unable to load account details."}
      </div>
    );
  }

  if (!account) {
    return <p className="text-gray-500">Account not found.</p>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <button
        type="button"
        onClick={() => navigate("/accounts")}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={18} />
        Back to accounts
      </button>

      {/* Page heading and Add Transaction button */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Account Details
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            View account information and financial activity.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(`/accounts/${id}/transactions/new`)}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          + Add Transaction
        </button>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
            <Wallet size={24} />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold text-gray-900">
              {account.name}
            </h2>
            <p className="mt-1 break-all text-xs text-gray-500">
              Account ID: {account.id}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-gray-50 p-5">
          <p className="text-sm text-gray-500">Available balance</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {formatCurrency(account.balance)}
          </p>
        </div>

        <div className="mt-5">
          <p className="text-sm text-gray-500">Created on</p>
          <p className="mt-1 font-medium text-gray-900">
            {new Date(account.createdAt).toLocaleString("en-IN")}
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Transaction History
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Transactions are displayed newest first.
          </p>
        </div>

        <TransactionTable
          transactions={transactions}
          isLoading={transactionsLoading}
          isError={transactionsError}
        />

        {!transactionsLoading && !transactionsError && (
          <TransactionPagination
            pagination={pagination}
            onPageChange={setPage}
          />
        )}
      </section>
    </div>
  );
}

export default AccountDetailsPage;
