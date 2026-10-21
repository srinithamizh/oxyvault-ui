import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { FiChevronLeft, FiChevronRight, FiEdit2, FiPlus, FiRefreshCw, FiTrash2 } from "react-icons/fi";
import Button from "@/components/Button/Button";
import Card from "@/components/Card/Card";
import DateTimePicker from "@/components/DateTimePicker/DateTimePicker";
import DropdownSelect from "@/components/DropdownSelect/DropdownSelect";
import IconButton from "@/components/IconButton/IconButton";
import Modal from "@/components/Modal/Modal";
import PageHeader from "@/components/PageHeader/PageHeader";
import SegmentedControl from "@/components/SegmentedControl/SegmentedControl";
import TextField from "@/components/TextField/TextField";
import { usePaymentMethods } from "@/hooks/usePaymentMethods/usePaymentMethods";
import { useSources } from "@/hooks/useSources/useSources";
import { useTransactionCategories } from "@/hooks/useTransactionCategories/useTransactionCategories";
import { useAuth } from "@/hooks/useAuth/useAuth";
import { queryKeys } from "@/data/queryClient";
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction,
  type Transaction,
  type TransactionInput,
} from "@/services/transactionsService/transactionsService";
import type { CategoryType } from "@/types/transactionOptions";

const PAGE_SIZE = 25;

interface TransactionDraft {
  description: string;
  createdAt: string;
  amount: string;
  type: CategoryType;
  sourceId: string;
  paymentId: string;
  categoryId: string;
  additionalInfo: string;
}

function localDateTimeValue(date: Date): string {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function emptyDraft(): TransactionDraft {
  return {
    description: "",
    createdAt: localDateTimeValue(new Date()),
    amount: "",
    type: "expense",
    sourceId: "",
    paymentId: "",
    categoryId: "",
    additionalInfo: "",
  };
}

function formatAmountField(value: string): string {
  if (!/^\d+(?:\.\d{1,2})?$/.test(value)) return value;
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toFixed(2) : value;
}

export default function ReportsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { sources } = useSources();
  const { methods } = usePaymentMethods();
  const { categories } = useTransactionCategories();
  const [pageNumber, setPageNumber] = useState(0);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const queryKey = ["transactions", pageNumber, PAGE_SIZE] as const;
  const sourcesQueryKey = queryKeys.sources(user?.id ?? "anonymous");
  const invalidateTransactionData = () => Promise.all([
    queryClient.invalidateQueries({ queryKey: ["transactions"] }),
    queryClient.invalidateQueries({ queryKey: sourcesQueryKey }),
  ]);
  const transactionsQuery = useQuery({
    queryKey,
    queryFn: () => getTransactions({ page: pageNumber, size: PAGE_SIZE }),
    staleTime: Infinity,
    meta: { requiresAuth: true },
  });
  const createMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: invalidateTransactionData,
    meta: { requiresAuth: true },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: TransactionInput }) => updateTransaction(id, input),
    onSuccess: invalidateTransactionData,
    meta: { requiresAuth: true },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: invalidateTransactionData,
    meta: { requiresAuth: true },
  });

  const page = transactionsQuery.data?.page;
  const rows = transactionsQuery.data?.content ?? [];
  const filteredCategories = categories.filter((category) => category.type === draft.type);
  const selectedSource = sources.find((source) => source.id === draft.sourceId);
  const transactionAmount = Number(draft.amount);
  const exceedsSourceBalance =
    draft.type === "expense" &&
    selectedSource !== undefined &&
    Number.isFinite(transactionAmount) &&
    transactionAmount > selectedSource.balance;

  const setField = <K extends keyof TransactionDraft>(field: K, value: TransactionDraft[K]) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setFormError(null);
  };

  const handleTypeChange = (type: CategoryType) => {
    setDraft((current) => ({ ...current, type, categoryId: "" }));
    setFormError(null);
  };

  const handleAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    const amount = Number(draft.amount);
    if (!draft.description.trim() || !/^\d+(?:\.\d{1,2})?$/.test(draft.amount) ||
      !Number.isFinite(amount) || amount <= 0 || !draft.createdAt ||
      !draft.sourceId || !draft.paymentId || !draft.categoryId) {
      setFormError(t("reports.form.validation"));
      return;
    }
    if (draft.type === "expense" && selectedSource && amount > selectedSource.balance) {
      setFormError(t("reports.form.amountExceedsBalance"));
      return;
    }

    const input: TransactionInput = {
      description: draft.description.trim(),
      amount,
      sourceId: draft.sourceId,
      paymentId: draft.paymentId,
      categoryId: draft.categoryId,
      currency: "INR",
      createdAt: new Date(draft.createdAt).toISOString(),
      ...(draft.additionalInfo.trim()
        ? { additionalInfo: draft.additionalInfo.trim() }
        : {}),
    };

    try {
      if (editingTransaction) {
        await updateMutation.mutateAsync({ id: editingTransaction.id, input });
      } else {
        await createMutation.mutateAsync(input);
      }
      setDraft(emptyDraft());
      setIsAddOpen(false);
      setEditingTransaction(null);
      setPageNumber(0);
    } catch (cause) {
      setFormError(t("reports.form.saveError"));
      console.error(
        `Could not ${editingTransaction ? "update" : "create"} transaction.`,
        cause instanceof Error ? cause.message : "Unexpected error",
      );
    }
  };

  const openEdit = (transaction: Transaction) => {
    const categoryType = categories.find((category) => category.id === transaction.categoryId)?.type ?? "expense";
    setDraft({
      description: transaction.description,
      createdAt: localDateTimeValue(new Date(transaction.createdAt)),
      amount: transaction.amount.toFixed(2),
      type: categoryType,
      sourceId: transaction.sourceId,
      paymentId: transaction.paymentId,
      categoryId: transaction.categoryId,
      additionalInfo: transaction.additionalInfo ?? "",
    });
    setFormError(null);
    setEditingTransaction(transaction);
    setIsAddOpen(true);
  };

  const closeForm = () => {
    setIsAddOpen(false);
    setEditingTransaction(null);
  };

  const handleDelete = async () => {
    if (!deletingTransaction) return;
    try {
      await deleteMutation.mutateAsync(deletingTransaction.id);
      setDeletingTransaction(null);
      setDeleteError(null);
    } catch (cause) {
      setDeleteError(t("reports.deleteError"));
      console.error("Could not delete transaction.", cause instanceof Error ? cause.message : "Unexpected error");
    }
  };

  const transactionLabel = (id: string, items: { id: string; name: string }[]) =>
    items.find((item) => item.id === id)?.name ?? t("reports.unknownItem");

  const currency = (amount: number, code: string) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: code }).format(amount);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={t("nav.reports")}
        subtitle={t("reports.subtitle")}
        action={
          <Button icon={FiPlus} onClick={() => {
            setDraft(emptyDraft());
            setFormError(null);
            setEditingTransaction(null);
            setIsAddOpen(true);
          }}>
            {t("reports.add")}
          </Button>
        }
      />

      <Card className="overflow-hidden p-0 hover:translate-y-0">
        {transactionsQuery.isError ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <p role="alert" className="text-sm text-danger">{t("reports.loadError")}</p>
            <Button variant="secondary" icon={FiRefreshCw} onClick={() => void transactionsQuery.refetch()}>
              {t("common.retry")}
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                <thead className="bg-surface-2 text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th scope="col" className="px-5 py-3">{t("reports.columns.date")}</th>
                    <th scope="col" className="px-5 py-3">{t("reports.columns.description")}</th>
                    <th scope="col" className="px-5 py-3">{t("reports.columns.category")}</th>
                    <th scope="col" className="px-5 py-3">{t("reports.columns.source")}</th>
                    <th scope="col" className="px-5 py-3">{t("reports.columns.payment")}</th>
                    <th scope="col" className="px-5 py-3 text-right">{t("reports.columns.amount")}</th>
                    <th scope="col" className="px-5 py-3 text-right">{t("reports.columns.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {transactionsQuery.isFetching && rows.length === 0 ? (
                    <tr><td colSpan={7} role="status" className="px-5 py-10 text-center text-muted">{t("common.loading")}</td></tr>
                  ) : rows.length === 0 ? (
                    <tr><td colSpan={7} className="px-5 py-10 text-center text-muted">{t("reports.empty")}</td></tr>
                  ) : rows.map((transaction) => {
                    const category = categories.find((item) => item.id === transaction.categoryId);
                    return (
                      <tr key={transaction.id} className="hover:bg-surface-2/50">
                        <td className="whitespace-nowrap px-5 py-3.5 text-muted">
                          {new Date(transaction.createdAt).toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-semibold">{transaction.description}</div>
                          {transaction.additionalInfo && (
                            <div className="mt-1 text-xs text-muted">{transaction.additionalInfo}</div>
                          )}
                        </td>
                        <td className="px-5 py-3.5">{transactionLabel(transaction.categoryId, categories)}</td>
                        <td className="px-5 py-3.5">{transactionLabel(transaction.sourceId, sources)}</td>
                        <td className="px-5 py-3.5">{transactionLabel(transaction.paymentId, methods)}</td>
                        <td className={`whitespace-nowrap px-5 py-3.5 text-right font-semibold ${
                          category?.type === "income" ? "text-success-text" : "text-danger"
                        }`}>
                          {currency(transaction.amount, transaction.currency)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-right">
                          <div className="flex justify-end">
                            <IconButton
                              icon={FiEdit2}
                              label={t("reports.edit", { description: transaction.description })}
                              onClick={() => openEdit(transaction)}
                            />
                            <IconButton
                              icon={FiTrash2}
                              label={t("reports.delete", { description: transaction.description })}
                              className="hover:text-danger"
                              onClick={() => {
                                setDeleteError(null);
                                setDeletingTransaction(transaction);
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3">
              <p className="text-xs text-muted">
                {page && page.totalElements > 0
                  ? t("reports.paginationSummary", {
                      from: page.number * page.size + 1,
                      to: page.number * page.size + rows.length,
                      total: page.totalElements,
                    })
                  : t("reports.paginationEmpty")}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  icon={FiChevronLeft}
                  disabled={transactionsQuery.isFetching || !page || page.number === 0}
                  onClick={() => setPageNumber((current) => Math.max(0, current - 1))}
                >
                  {t("reports.previous")}
                </Button>
                <span className="min-w-20 text-center text-xs text-muted">
                  {page ? t("reports.page", { current: page.number + 1, total: Math.max(page.totalPages, 1) }) : ""}
                </span>
                <Button
                  variant="secondary"
                  icon={FiChevronRight}
                  disabled={transactionsQuery.isFetching || !page || page.number >= page.totalPages - 1}
                  onClick={() => setPageNumber((current) => current + 1)}
                >
                  {t("reports.next")}
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {isAddOpen && (
        <Modal
          title={t(editingTransaction ? "reports.form.editTitle" : "reports.form.title")}
          description={t("reports.form.description")}
          onClose={closeForm}
        >
          <form noValidate onSubmit={handleAdd} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3 max-[520px]:grid-cols-1">
              <DateTimePicker
                label={t("reports.form.dateLabel")}
                value={draft.createdAt}
                required
                onChange={(value) => setField("createdAt", value)}
              />
              <SegmentedControl
                label={t("reports.form.typeLabel")}
                name="transaction-type"
                value={draft.type}
                onChange={handleTypeChange}
                options={[
                  { value: "expense", label: t("transactionOptions.kinds.expense") },
                  { value: "income", label: t("transactionOptions.kinds.income") },
                ]}
              />
            </div>
            <TextField
              label={t("reports.form.descriptionLabel")}
              value={draft.description}
              required
              autoFocus
              onChange={(event) => setField("description", event.target.value)}
            />
            <div className="grid grid-cols-2 items-start gap-3 max-[520px]:grid-cols-1">
              <div className="flex flex-col gap-2">
                <DropdownSelect
                  label={t("reports.form.sourceLabel")}
                  value={draft.sourceId}
                  placeholder={t("reports.form.chooseSource")}
                  options={sources.map((source) => ({ value: source.id, label: source.name }))}
                  required
                  onChange={(value) => setField("sourceId", value)}
                />
                {selectedSource && (
                  <p className="text-xs text-muted" role="status">
                    {t("reports.form.sourceBalance", {
                      amount: new Intl.NumberFormat(undefined, { style: "currency", currency: "INR" }).format(selectedSource.balance),
                    })}
                  </p>
                )}
              </div>
              <TextField
                label={t("reports.form.amountLabel")}
                type="text"
                inputMode="decimal"
                value={draft.amount}
                placeholder="0.00"
                required
                error={exceedsSourceBalance ? t("reports.form.amountExceedsBalance") : undefined}
                onChange={(event) => setField("amount", event.target.value)}
                onBlur={(event) => setField("amount", formatAmountField(event.target.value))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 max-[520px]:grid-cols-1">
              <DropdownSelect
                label={t("reports.form.paymentLabel")}
                value={draft.paymentId}
                placeholder={t("reports.form.choosePayment")}
                options={methods.map((method) => ({ value: method.id, label: method.name }))}
                required
                onChange={(value) => setField("paymentId", value)}
              />
              <DropdownSelect
                label={t("reports.form.categoryLabel")}
                value={draft.categoryId}
                placeholder={t("reports.form.chooseCategory")}
                options={filteredCategories.map((category) => ({ value: category.id, label: category.name }))}
                required
                onChange={(value) => setField("categoryId", value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="transaction-additional-info" className="text-xs font-semibold text-muted">
                {t("reports.form.additionalInfoLabel")}
              </label>
              <textarea
                id="transaction-additional-info"
                value={draft.additionalInfo}
                rows={3}
                onChange={(event) => setField("additionalInfo", event.target.value)}
                className="w-full resize-y rounded-[9px] border border-border bg-surface px-3 py-3 text-sm text-fg outline-none transition-colors placeholder:text-muted focus-visible:ring-2 focus-visible:ring-accent"
              />
            </div>
            {formError && <p role="alert" className="text-[11px] text-danger">{formError}</p>}
            <div className="mt-1 flex justify-end gap-2 border-t border-border pt-[15px]">
              <Button variant="secondary" onClick={closeForm} disabled={createMutation.isPending || updateMutation.isPending}>
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                icon={createMutation.isPending || updateMutation.isPending ? FiRefreshCw : undefined}
              >
                {t(createMutation.isPending || updateMutation.isPending
                  ? "common.loading"
                  : editingTransaction ? "reports.form.saveChanges" : "reports.form.submit")}
              </Button>
            </div>
          </form>
        </Modal>
      )}
      {deletingTransaction && (
        <Modal
          title={t("reports.deleteTitle")}
          description={t("reports.deleteDescription")}
          onClose={() => setDeletingTransaction(null)}
        >
          <p className="font-semibold text-fg">{deletingTransaction.description}</p>
          {deleteError && <p role="alert" className="mt-3 text-[11px] text-danger">{deleteError}</p>}
          <div className="mt-5 flex justify-end gap-2 border-t border-border pt-[15px]">
            <Button
              variant="secondary"
              disabled={deleteMutation.isPending}
              onClick={() => setDeletingTransaction(null)}
            >
              {t("common.cancel")}
            </Button>
            <Button variant="danger" disabled={deleteMutation.isPending} onClick={() => void handleDelete()}>
              {t(deleteMutation.isPending ? "common.loading" : "reports.deleteConfirm")}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
