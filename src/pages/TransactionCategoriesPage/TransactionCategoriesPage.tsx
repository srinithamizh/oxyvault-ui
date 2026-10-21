import { useTranslation } from "react-i18next";
import OptionSection from "@/features/settings/transactionOptions/OptionSection/OptionSection";
import { useTransactionCategories } from "@/hooks/useTransactionCategories/useTransactionCategories";

export default function TransactionCategoriesPage() {
  const { t } = useTranslation();
  const { categories, loading, error, reloadCategories, addCategory, updateCategory, removeCategory } =
    useTransactionCategories();

  return (
    <OptionSection
      variant="categories"
      items={categories}
      onAdd={({ name, type = "expense" }) => addCategory({ name, type })}
      onUpdate={(id, { name, type = "expense" }) => updateCategory(id, { name, type })}
      onRemove={removeCategory}
      loading={loading}
      error={
        error === "load"
          ? t("transactionOptions.categories.loadError")
          : error
            ? t("transactionOptions.categories.mutationError")
            : null
      }
      onRetry={error === "load" ? () => void reloadCategories() : undefined}
    />
  );
}
