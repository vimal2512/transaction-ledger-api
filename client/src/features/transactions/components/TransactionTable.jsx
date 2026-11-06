import {
  ArrowDownLeft,
  ArrowUpRight,
  ReceiptText,
} from "lucide-react";

function formatCurrency(amount) {
  return `₹${Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function TransactionTable({ transactions = [], isLoading, isError }) {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-sm text-gray-500">
        Loading transactions...
      </div>
    );
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="p-8 text-center text-sm text-red-600"
      >
        Unable to load transactions. Please try again.
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="p-10 text-center">
        <ReceiptText
          className="mx-auto text-gray-400"
          size={32}
        />
        <p className="mt-3 font-medium text-gray-900">
          No transactions yet
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Transactions for this account will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[720px] table-fixed text-left text-sm">
        <colgroup>
          <col className="w-[24%]" />
          <col className="w-[28%]" />
          <col className="w-[28%]" />
          <col className="w-[20%]" />
        </colgroup>

        <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-4 font-medium">
              Transaction
            </th>
            <th className="px-4 py-4 font-medium">
              Reference ID
            </th>
            <th className="px-4 py-4 font-medium">
              Date
            </th>
            <th className="px-4 py-4 text-right font-medium">
              Amount
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {transactions.map((transaction) => {
            const isCredit = transaction.type === "credit";

            return (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-4 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`shrink-0 rounded-lg p-2 ${
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

                    <div className="min-w-0">
                      <p className="font-medium capitalize text-gray-900">
                        {transaction.type}
                      </p>
                      <p
                        className="mt-1 truncate text-xs text-gray-500"
                        title={transaction.description || "No description"}
                      >
                        {transaction.description || "No description"}
                      </p>
                    </div>
                  </div>
                </td>

                <td
                  className="truncate px-4 py-4 text-gray-500"
                  title={transaction.referenceId}
                >
                  {transaction.referenceId}
                </td>

                <td className="px-4 py-4 text-gray-500">
                  <span
                    className="block truncate"
                    title={new Date(transaction.createdAt).toLocaleString("en-IN")}
                  >
                    {new Date(transaction.createdAt).toLocaleString("en-IN")}
                  </span>
                </td>

                <td
                  className={`whitespace-nowrap px-4 py-4 text-right font-semibold ${
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
  );
}

export default TransactionTable;
