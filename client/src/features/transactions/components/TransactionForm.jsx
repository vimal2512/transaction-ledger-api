import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowUpRight,
  LoaderCircle,
} from "lucide-react";
import { transactionsApi } from "../api/transactions.api.js";

const transactionSchema = z.object({
  type: z.enum(["credit", "debit"]),

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

  description: z
    .string()
    .trim()
    .max(255, "Description cannot exceed 255 characters."),
});

function TransactionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "credit",
      amount: "",
      referenceId: "",
      description: "",
    },
  });

  const selectedType = watch("type");

  const createMutation = useMutation({
    mutationFn: (formData) =>
      transactionsApi.create(id, {
        ...formData,
        amount: formData.amount.trim(),
        referenceId: formData.referenceId.trim(),
        description: formData.description.trim() || undefined,
      }),

    onSuccess: async () => {
      await Promise.all([
        // Refresh the current account's transaction history.
        queryClient.invalidateQueries({
          queryKey: ["transactions", id],
        }),

        // Refresh account lists and account details.
        queryClient.invalidateQueries({
          queryKey: ["accounts"],
        }),

        // Refresh the dashboard's total account balance.
        queryClient.invalidateQueries({
          queryKey: ["account-summary"],
        }),

        // Refresh the global transactions list.
        queryClient.invalidateQueries({
          queryKey: ["all-transactions"],
        }),
      ]);

      navigate(`/accounts/${id}`);
    },
  });

  const onSubmit = (formData) => {
    createMutation.mutate(formData);
  };

  const errorData = createMutation.error?.response?.data;

  const serverMessage =
    typeof errorData?.message === "string"
      ? errorData.message
      : typeof errorData?.error === "string"
        ? errorData.error
        : typeof errorData?.error?.message === "string"
          ? errorData.error.message
          : typeof errorData?.message?.message === "string"
            ? errorData.message.message
            : "Unable to create the transaction. Please try again.";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Add Transaction
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Record a credit or debit for this account.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Transaction type
          </label>

          <div className="grid grid-cols-2 gap-3">
            {["credit", "debit"].map((type) => (
              <label
                key={type}
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium capitalize transition ${
                  selectedType === type
                    ? type === "credit"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  value={type}
                  {...register("type")}
                  className="sr-only"
                />

                {type === "credit" ? (
                  <ArrowDownLeft size={18} />
                ) : (
                  <ArrowUpRight size={18} />
                )}

                {type}
              </label>
            ))}
          </div>

          {errors.type && (
            <p className="mt-2 text-sm text-red-600">
              {errors.type.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="amount"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Amount (INR)
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
            Reference ID
          </label>

          <input
            id="referenceId"
            type="text"
            placeholder="e.g. CASH-DEPOSIT-001"
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

        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Description{" "}
            <span className="font-normal text-gray-400">
              (optional)
            </span>
          </label>

          <textarea
            id="description"
            rows={3}
            placeholder="Add a short description"
            {...register("description")}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            aria-invalid={Boolean(errors.description)}
          />

          {errors.description && (
            <p className="mt-2 text-sm text-red-600">
              {errors.description.message}
            </p>
          )}
        </div>

        {createMutation.isError && (
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
            onClick={() => navigate(`/accounts/${id}`)}
            className="rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createMutation.isPending && (
              <LoaderCircle size={18} className="animate-spin" />
            )}

            {createMutation.isPending
              ? "Saving..."
              : "Save Transaction"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TransactionForm;
