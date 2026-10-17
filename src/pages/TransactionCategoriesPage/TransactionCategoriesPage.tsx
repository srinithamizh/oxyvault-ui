import OptionSection from "@/features/settings/transactionOptions/OptionSection/OptionSection";
import { useTransactionCategories } from "@/hooks/useTransactionCategories/useTransactionCategories";

export default function TransactionCategoriesPage() {
  const { categories, addCategory, updateCategory, removeCategory } = useTransactionCategories();

  return (
    <OptionSection
      variant="categories"
      items={categories}
      onAdd={({ name, type = "expense" }) => addCategory({ name, type })}
      onUpdate={(id, { name, type = "expense" }) => updateCategory(id, { name, type })}
      onRemove={removeCategory}
    />
  );
}
