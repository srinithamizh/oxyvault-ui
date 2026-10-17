import OptionSection from "@/features/settings/transactionOptions/OptionSection/OptionSection";
import { usePaymentMethods } from "@/hooks/usePaymentMethods/usePaymentMethods";

export default function PaymentMethodsPage() {
  const { methods, addMethod, updateMethod, removeMethod } = usePaymentMethods();

  return (
    <OptionSection
      variant="methods"
      items={methods}
      onAdd={({ name }) => addMethod({ name })}
      onUpdate={(id, { name }) => updateMethod(id, { name })}
      onRemove={removeMethod}
    />
  );
}
