import type { Source } from "@/types/source";

export const testSources: Source[] = [
  { id: "s-1", type: "bank", name: "HDFC Bank", accountType: "savings", lastFour: "4582", balance: 248820 },
  { id: "s-2", type: "card", name: "HDFC Regalia", lastFour: "8291", creditLimit: 500000, balance: 34680 },
  { id: "s-3", type: "cash", name: "Cash", balance: 12450 },
  { id: "s-4", type: "loan", name: "Home Loan", provider: "SBI", emi: 32400, interestRate: 8.5, balance: 1842000 },
];
