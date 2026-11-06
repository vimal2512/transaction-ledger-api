import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowLeftRight, LoaderCircle } from "lucide-react";
import { accountsApi } from "../../accounts/api/accounts.api.js";
import { transfersApi } from "../api/transfers.api.js";

const transferSchema = z
  .object({
    sourceAccountId: z
      .string()
      .min(1, "Select the source account."),

    destinationAccountId: z
      .string()
      .min(1, "Select the destination account."),

    amount: z
      .string()
      .trim()
      .regex(
        /^\d+(\.\d{1,2})?$/,
        "Enter a valid amount with up to 2 decimal places."
      )
      .refine(
        (value) => Number(value) > 0,
        "Amount must be greater than zero."
      ),

    referenceId: z
      .string()
      .trim()
      .min(1, "Reference ID is required.")
      .max(100, "Reference ID is too long."),
  })
  .refine(
    (data) =>
      data.sourceAccountId !== data.destinationAccountId,
    {
      message: "Source and destination accounts must be different.",
      path: ["destinationAccountId"],
    }
  );

function TransferForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Load every account for the transfer dropdowns.
  const {
    data: accountsResponse,
    isLoading: accountsLoading,
    isError: accountsError,
  } = useQuery({
    queryKey: ["accounts", "all-for-transfer"],
    queryFn: accountsApi.getAllForTransfer,
  });

  const accounts = accountsResponse?.data ?? [];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      sourceAccountId: "",
      destinationAccountId: "",
      amount: "",
      referenceId: "",
    },
  });

  const transferMutation = useMutation({
    mutationFn: (formData) =>
      transfersApi.create({
        ...formData,
        amount: formData.amount.trim(),
        referenceId: formData.referenceId.trim(),
      }),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["accounts"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["transactions"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["all-transactions"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["account-summary"],
        }),
      ]);

      navigate("/accounts");
    },

    onError: async () => {
      // Refresh account information after a rejected transfer.
      await queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });
    },
  });

  const onSubmit = (formData) => {
    transferMutation.mutate(formData);
  };

  const errorData = transferMutation.error?.response?.data;

  const serverMessage =
    typeof errorData?.message === "string"
      ? errorData.message
      : typeof errorData?.error === "string"
        ? errorData.error
        : typeof errorData?.error?.message === "string"
          ? errorData.error.message
          : typeof errorData?.message?.message === "string"
            ? errorData.message.message
            : "Unable to complete the transfer. Please try again.";

  if (accountsLoading) {
    return (
      <p className="text-gray-500">
        Loading accounts...
      </p>
    );
  }

  if (accountsError) {
    return (
      <p role="alert" className="text-red-600">
        Unable to load accounts. Please check your backend connection.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Transfer Money
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Transfer money between two accounts.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label
            htmlFor="sourceAccountId"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            From account
          </label>

          <select
            id="sourceAccountId"
            {...register("sourceAccountId")}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Select source account</option>

            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} — ₹
                {Number(account.balance).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </option>
            ))}
          </select>

          {errors.sourceAccountId && (
            <p className="mt-2 text-sm text-red-600">
              {errors.sourceAccountId.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="destinationAccountId"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            To account
          </label>

          <select
            id="destinationAccountId"
            {...register("destinationAccountId")}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Select destination account</option>

            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} — ₹
                {Number(account.balance).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </option>
            ))}
          </select>

          {errors.destinationAccountId && (
            <p className="mt-2 text-sm text-red-600">
              {errors.destinationAccountId.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="amount"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Transfer amount (INR)
          </label>

          <input
            id="amount"
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            {...register("amount")}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            aria-invalid={Boolean(errors.amount)}
          />

          {errors.amount && (
            <p className="mt-2 text-sm text-red-600">
              {errors.amount.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="referenceId"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Transfer reference ID
          </label>

          <input
            id="referenceId"
            type="text"
            placeholder="e.g. TRANSFER-001"
            {...register("referenceId")}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            aria-invalid={Boolean(errors.referenceId)}
          />

          {errors.referenceId && (
            <p className="mt-2 text-sm text-red-600">
              {errors.referenceId.message}
            </p>
          )}
        </div>

        {accounts.length < 2 && (
          <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            You need at least two accounts to make a transfer.
          </p>
        )}

        {transferMutation.isError && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {serverMessage}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate("/accounts")}
            className="rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              transferMutation.isPending || accounts.length < 2
            }
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {transferMutation.isPending ? (
              <LoaderCircle
                size={18}
                className="animate-spin"
              />
            ) : (
              <ArrowLeftRight size={18} />
            )}

            {transferMutation.isPending
              ? "Transferring..."
              : "Transfer Money"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TransferForm;
