import { Wallet, IndianRupee, ArrowLeftRight } from "lucide-react";

function SummaryCards({ accountCount, totalBalance }) {
  const summaries = [
    {
      title: "Total Accounts",
      value: accountCount.toLocaleString("en-IN"),
      description: "Accounts created",
      icon: Wallet,
      iconStyle: "bg-blue-50 text-blue-600",
    },
    {
      title: "Combined Balance",
      value: `₹${totalBalance.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      description: "Across all accounts",
      icon: IndianRupee,
      iconStyle: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Transactions",
      value: "—",
      description: "We'll connect transaction history next",
      icon: ArrowLeftRight,
      iconStyle: "bg-violet-50 text-violet-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {summaries.map(({ title, value, description, icon: Icon, iconStyle }) => (
        <div
          key={title}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <h3 className="mt-3 text-2xl font-bold text-gray-900">
                {value}
              </h3>
            </div>

            <div className={`rounded-xl p-3 ${iconStyle}`}>
              <Icon size={22} />
            </div>
          </div>

          <p className="mt-4 text-sm text-gray-500">{description}</p>
        </div>
      ))}
    </div>
  );
}

export default SummaryCards;
