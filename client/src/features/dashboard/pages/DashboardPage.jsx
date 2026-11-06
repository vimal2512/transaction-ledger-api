import { useAccounts } from "../../accounts/hooks/useAccounts.js";
import { useAccountSummary } from "../../accounts/hooks/useAccountSummary.js";
import SummaryCards from "../components/SummaryCard.jsx";

function formatCurrency(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function DashboardPage() {
  const {
    data: accountsData,
    isLoading: accountsLoading,
    isError: accountsError,
  } = useAccounts(1, 5);

  const {
    data: summaryData,
    isLoading: summaryLoading,
    isError: summaryError,
  } = useAccountSummary();

  const accounts = accountsData?.data?.accounts ?? [];
  const summary = summaryData?.data;

  const isLoading = accountsLoading || summaryLoading;
  const isError = accountsError || summaryError;

  if (isLoading) {
    return <p className="text-gray-500">Loading dashboard...</p>;
  }

  if (isError) {
    return (
      <p className="text-red-600">
        Unable to load dashboard data. Please check your backend connection.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-500">
          Overview of your accounts and financial activity.
        </p>
      </div>

      <SummaryCards
        accountCount={Number(summary?.totalAccounts ?? 0)}
        totalBalance={Number(summary?.totalBalance ?? 0)}
      />

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Accounts Overview
          </h2>

          <span className="text-sm text-gray-500">Latest 5 accounts</span>
        </div>

        {accounts.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">
            No accounts found. Create an account to get started.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-gray-100">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900">
                    {account.name}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Created{" "}
                    {new Date(account.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>

                <p className="shrink-0 font-semibold text-gray-900">
                  {formatCurrency(account.balance)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default DashboardPage;
