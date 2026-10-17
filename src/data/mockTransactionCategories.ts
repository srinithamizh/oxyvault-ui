import type { TransactionCategory } from "@/types/transactionOptions";

// Dummy data used until the backend API is available.
export const seedCategories: TransactionCategory[] = [
  { id: "c-1", name: "Salary", type: "income" },
  { id: "c-2", name: "Side income", type: "income" },
  { id: "c-3", name: "Interest", type: "income" },
  { id: "c-4", name: "Food & dining", type: "expense" },
  { id: "c-5", name: "Transport", type: "expense" },
  { id: "c-6", name: "Shopping", type: "expense" },
  { id: "c-7", name: "Utilities", type: "expense" },
  { id: "c-8", name: "Rent", type: "expense" },
  { id: "c-9", name: "Health", type: "expense" },
  { id: "c-10", name: "Entertainment", type: "expense" },
];
