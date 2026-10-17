import { useMemo, useState, type ReactNode } from "react";
import { seedPaymentMethods } from "@/data/mockPaymentMethods";
import { PaymentMethodsContext, type PaymentMethodsContextValue } from "@/hooks/usePaymentMethods/usePaymentMethods";
import type { PaymentMethod } from "@/types/transactionOptions";

let nextId = 1;
const createId = () => `m-new-${nextId++}`;

/**
 * Keeps payment methods in memory, seeded with dummy data. This is the only data the Payment Methods
 * page needs, so it will map to a single API call. Replace the bodies below with API calls later.
 */
export default function PaymentMethodsProvider({
  children,
  initialMethods = seedPaymentMethods,
}: {
  children: ReactNode;
  initialMethods?: PaymentMethod[];
}) {
  const [methods, setMethods] = useState(initialMethods);

  const value = useMemo<PaymentMethodsContextValue>(
    () => ({
      methods,
      addMethod: (input) => setMethods((current) => [...current, { ...input, id: createId() }]),
      updateMethod: (id, input) =>
        setMethods((current) => current.map((item) => (item.id === id ? { ...input, id } : item))),
      removeMethod: (id) => setMethods((current) => current.filter((item) => item.id !== id)),
    }),
    [methods],
  );

  return <PaymentMethodsContext.Provider value={value}>{children}</PaymentMethodsContext.Provider>;
}
