import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { MemoryRouter } from "react-router";
import SourcesProvider from "@/features/settings/sources/SourcesProvider/SourcesProvider";
import PaymentMethodsProvider from "@/features/settings/paymentMethods/PaymentMethodsProvider/PaymentMethodsProvider";
import TransactionCategoriesProvider from "@/features/settings/transactionCategories/TransactionCategoriesProvider/TransactionCategoriesProvider";
import AuthProvider from "@/features/auth/AuthProvider/AuthProvider";
import { UserRole } from "@/types/user";
import type { AuthUser } from "@/services/authService/authService";
import ThemeProvider from "@/theme/ThemeProvider/ThemeProvider";

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
}

export function renderWithProviders(ui: ReactElement, { route = "/", user = testUser }: RenderOptions = {}) {
  return render(
    <ThemeProvider>
      <AuthProvider initialUser={user}>
        <SourcesProvider>
          <PaymentMethodsProvider>
            <TransactionCategoriesProvider>
              <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
            </TransactionCategoriesProvider>
          </PaymentMethodsProvider>
        </SourcesProvider>
      </AuthProvider>
    </ThemeProvider>,
  );
}
