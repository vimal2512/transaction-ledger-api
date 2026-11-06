import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Wallet, ArrowUpRight } from "lucide-react";
import { useAccounts } from "../hooks/useAccounts.js";

function formatCurrency(amount) {
  return `₹${Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function AccountsPage() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError, error, isFetching } = useAccounts(
    page,
    limit
  );

  const accounts = data?.data?.accounts ?? [];
  const pagination = data?.data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
          <p className="mt-2 text-sm text-gray-500">
            View and manage your financial accounts.
          </p>
        </div>

        <Link
          to="/accounts/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Create Account
        </Link>
      </div>

      {isLoading && (
        <p className="rounded-xl border border-gray-200 bg-white p-6 text-gray-500">
          Loading accounts...
        </p>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error?.response?.data?.message ||
            "Unable to load accounts. Please try again."}
        </div>
      )}

      {!isLoading && !isError && accounts.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
          <Wallet className="mx-auto text-gray-400" size={36} />
          <h2 className="mt-4 font-semibold text-gray-900">
            No accounts yet
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Create your first account to get started.
          </p>
          <Link
            to="/accounts/new"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            Create Account
          </Link>
        </div>
      )}

      {!isLoading && !isError && accounts.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {accounts.length} of {pagination?.totalRecords ?? accounts.length} accounts
            </p>
            {isFetching && (
              <span className="text-xs text-gray-400">Updating...</span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {accounts.map((account) => (
              <article
                key={account.id}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                    <Wallet size={22} />
                  </div>

                  <Link
                    to={`/accounts/${account.id}`}
                    aria-label={`View ${account.name}`}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                  >
                    <ArrowUpRight size={20} />
                  </Link>
                </div>

                <h2 className="mt-5 truncate text-lg font-semibold text-gray-900">
                  {account.name}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Available balance
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {formatCurrency(account.balance)}
                </p>

                <p className="mt-4 border-t border-gray-100 pt-4 text-xs text-gray-500">
                  Created{" "}
                  {new Date(account.createdAt).toLocaleDateString("en-IN")}
                </p>
              </article>
            ))}
          </div>

          {pagination && (
            <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row">
              <p className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => current - 1)}
                  disabled={page <= 1 || isFetching}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                <button
                  type="button"
                  onClick={() => setPage((current) => current + 1)}
                  disabled={page >= pagination.totalPages || isFetching}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AccountsPage;
