import { createContext, useContext } from "react";
import type { PaymentMethod, PaymentMethodInput } from "@/types/transactionOptions";

export interface PaymentMethodsContextValue {
  methods: PaymentMethod[];
  loading: boolean;
  error: "load" | "mutation" | null;
  reloadMethods: () => Promise<void>;
  addMethod: (input: PaymentMethodInput) => Promise<void>;
  updateMethod: (id: string, input: PaymentMethodInput) => Promise<void>;
  removeMethod: (id: string) => Promise<void>;
}

export const PaymentMethodsContext = createContext<PaymentMethodsContextValue | null>(null);

export function usePaymentMethods(): PaymentMethodsContextValue {
  const context = useContext(PaymentMethodsContext);
  if (!context) {
    throw new Error("usePaymentMethods must be used inside <PaymentMethodsProvider>");
  }
  return context;
}
