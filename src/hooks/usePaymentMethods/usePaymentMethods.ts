import { createContext, useContext } from "react";
import type { PaymentMethod, PaymentMethodInput } from "@/types/transactionOptions";

export interface PaymentMethodsContextValue {
  methods: PaymentMethod[];
  addMethod: (input: PaymentMethodInput) => void;
  updateMethod: (id: string, input: PaymentMethodInput) => void;
  removeMethod: (id: string) => void;
}

export const PaymentMethodsContext = createContext<PaymentMethodsContextValue | null>(null);

export function usePaymentMethods(): PaymentMethodsContextValue {
  const context = useContext(PaymentMethodsContext);
  if (!context) {
    throw new Error("usePaymentMethods must be used inside <PaymentMethodsProvider>");
  }
  return context;
}
