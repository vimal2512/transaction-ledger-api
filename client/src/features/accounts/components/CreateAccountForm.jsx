import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { accountsApi } from "../api/accounts.api.js";
import { ArrowLeft, LoaderCircle } from "lucide-react";

const accountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Account name must be at least 2 characters.")
    .max(100, "Account name cannot exceed 100 characters."),
});

function CreateAccountForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
    },
  });

  const createAccountMutation = useMutation({
    mutationFn: accountsApi.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["accounts"] });
      navigate("/accounts");
    },
  });

  const onSubmit = (formData) => {
    createAccountMutation.mutate(formData);
  };

  const serverMessage =
    createAccountMutation.error?.response?.data?.message;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <button
        type="button"
        onClick={() => navigate("/accounts")}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={18} />
        Back to accounts
      </button>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
        <p className="mt-2 text-sm text-gray-500">
          Add a new account to your transaction management system.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Account name
          </label>

          <input
            id="name"
            type="text"
            placeholder="e.g. Personal Savings"
            autoComplete="off"
            {...register("name")}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            aria-invalid={Boolean(errors.name)}
          />

          {errors.name && (
            <p className="mt-2 text-sm text-red-600">
              {errors.name.message}
            </p>
          )}
        </div>

        {createAccountMutation.isError && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {serverMessage || "Unable to create the account. Please try again."}
          </p>
        )}

        <button
          type="submit"
          disabled={createAccountMutation.isPending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {createAccountMutation.isPending && (
            <LoaderCircle size={18} className="animate-spin" />
          )}
          {createAccountMutation.isPending ? "Creating..." : "Create Account"}
        </button>
      </form>
    </div>
  );
}

export default CreateAccountForm;
