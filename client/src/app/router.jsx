import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import DashboardPage from "../features/dashboard/pages/DashboardPage.jsx";
import AccountsPage from "../features/accounts/pages/AccountsPage.jsx";
import CreateAccountForm from "../features/accounts/components/CreateAccountForm.jsx";
import AccountDetailsPage from "../features/accounts/pages/AccountDetailsPage.jsx";
import TransactionForm from "../features/transactions/components/TransactionForm.jsx";
import TransfersPage from "../features/transfers/pages/TransfersPage.jsx";
import TransactionsPage from "../features/transactions/pages/TransactionsPage.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "accounts",
        element: <AccountsPage />,
      },
      {
        path: "accounts/new",
        element: <CreateAccountForm />,
      },
      {
        path: "accounts/:id",
        element: <AccountDetailsPage />,
      },
      {
       path: "accounts/:id/transactions/new",
       element: <TransactionForm />,
      },
      {
       path: "transfers",
       element: <TransfersPage />,
      },
      { path: "transactions", 
        element: <TransactionsPage /> },
    ],
  },
]);

export default router;
