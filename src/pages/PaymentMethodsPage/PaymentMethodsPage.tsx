import { useTranslation } from "react-i18next";
import OptionSection from "@/features/settings/transactionOptions/OptionSection/OptionSection";
import { usePaymentMethods } from "@/hooks/usePaymentMethods/usePaymentMethods";

export default function PaymentMethodsPage() {
  const { t } = useTranslation();
  const { methods, loading, error, reloadMethods, addMethod, updateMethod, removeMethod } = usePaymentMethods();

  return (
    <OptionSection
      variant="methods"
      items={methods}
      onAdd={({ name }) => addMethod({ name })}
      onUpdate={(id, { name }) => updateMethod(id, { name })}
      onRemove={removeMethod}
      loading={loading}
      error={
        error === "load"
          ? t("transactionOptions.methods.loadError")
          : error
            ? t("transactionOptions.methods.mutationError")
            : null
      }
      onRetry={error === "load" ? () => void reloadMethods() : undefined}
    />
  );
}
