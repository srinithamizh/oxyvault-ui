import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import SourcesProvider from "@/features/settings/sources/SourcesProvider/SourcesProvider";
import PaymentMethodsProvider from "@/features/settings/paymentMethods/PaymentMethodsProvider/PaymentMethodsProvider";
import TransactionCategoriesProvider from "@/features/settings/transactionCategories/TransactionCategoriesProvider/TransactionCategoriesProvider";
import AuthProvider from "@/features/auth/AuthProvider/AuthProvider";
import { UserRole } from "@/types/user";
import type { AuthUser } from "@/services/authService/authService";
import ThemeProvider from "@/theme/ThemeProvider/ThemeProvider";
import type { TransactionCategory } from "@/types/transactionOptions";
import { testSources } from "@/test/fixtures/sources";
import type { Source } from "@/types/source";
import type { PaymentMethod } from "@/types/transactionOptions";
import { testPaymentMethods } from "@/test/fixtures/paymentMethods";
import { createQueryClient } from "@/data/queryClient";

export const testUser: AuthUser = {
  id: "u-test",
  name: "Arjun Kumar",
  username: "arjun",
  email: "arjun@example.com",
  role: UserRole.Admin,
};

interface RenderOptions {
  route?: string;
  /** Signed-in user for the test. Pass `null` to start signed out. Defaults to `testUser`. */
  user?: AuthUser | null;
  /** Category fixtures for tests; defaults to an empty list without triggering an API request. */
  initialCategories?: TransactionCategory[] | null;
  /** Source fixtures for tests; defaults to test sources without triggering an API request. */
  initialSources?: Source[] | null;
  /** Payment-method fixtures for tests; defaults to test data without triggering an API request. */
  initialMethods?: PaymentMethod[] | null;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    route = "/",
    user = testUser,
    initialCategories = [],
    initialSources = testSources,
    initialMethods = testPaymentMethods,
  }: RenderOptions = {},
) {
  const queryClient = createQueryClient();
  const shouldLoadSharedData = route === "/" || route === "/dashboard" || route === "/reports";
const content =
  user === null ? (
    ui
  ) : (
    <SourcesProvider initialSources={initialSources ?? undefined} shouldLoad={shouldLoadSharedData}>
      <PaymentMethodsProvider initialMethods={initialMethods ?? undefined} shouldLoad={shouldLoadSharedData}>
        <TransactionCategoriesProvider
          initialCategories={initialCategories ?? undefined}
          shouldLoad={shouldLoadSharedData}
        >{ui}</TransactionCategoriesProvider>
      </PaymentMethodsProvider>
    </SourcesProvider>
  );
return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider initialUser={user}>
          <MemoryRouter initialEntries={[route]}>{content}</MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}
