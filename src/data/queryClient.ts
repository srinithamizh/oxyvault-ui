import { QueryClient } from "@tanstack/react-query";

export const queryKeys = {
  currentUser: ["auth", "currentUser"] as const,
  usernameAvailability: (username: string) => ["auth", "usernameAvailability", username] as const,
  sources: (userId: string) => ["sources", userId] as const,
  paymentMethods: (userId: string) => ["paymentMethods", userId] as const,
  transactionCategories: (userId: string) => ["transactionCategories", userId] as const,
  adminUsers: (page: number, size: number) => ["adminUsers", page, size] as const,
};

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  });
}
