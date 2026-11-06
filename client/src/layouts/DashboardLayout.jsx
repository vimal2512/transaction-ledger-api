import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Send,
  Landmark,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Accounts",
    path: "/accounts",
    icon: Wallet,
  },
  {
    name: "Transactions",
    path: "/transactions",
    icon: ArrowLeftRight,
  },
  {
    name: "Transfers",
    path: "/transfers",
    icon: Send,
  },
];

function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 md:flex">
      <aside className="w-full border-r border-gray-200 bg-white md:min-h-screen md:w-64">
        <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-5">
          <div className="rounded-xl bg-blue-600 p-2 text-white">
            <Landmark size={22} />
          </div>

          <div>
            <h1 className="font-bold">LedgerFlow</h1>
            <p className="text-xs text-gray-500">
              Transaction Management
            </p>
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto p-4 md:flex-col">
          {navigation.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
            >
              <Icon size={18} />
              {name}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
          <h2 className="font-semibold">Overview</h2>
          <span className="text-sm text-gray-500">
            Finance Dashboard
          </span>
        </header>

        <main className="p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
