import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App";
import "./i18n/i18n";
import GlobalLoader from "./components/GlobalLoader/GlobalLoader";
import SourcesProvider from "./features/settings/sources/SourcesProvider/SourcesProvider";
import PaymentMethodsProvider from "./features/settings/paymentMethods/PaymentMethodsProvider/PaymentMethodsProvider";
import TransactionCategoriesProvider from "./features/settings/transactionCategories/TransactionCategoriesProvider/TransactionCategoriesProvider";
import AuthProvider from "./features/auth/AuthProvider/AuthProvider";
import ThemeProvider from "./theme/ThemeProvider/ThemeProvider";
import "./styles/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <SourcesProvider>
          <PaymentMethodsProvider>
            <TransactionCategoriesProvider>
              <BrowserRouter>
                <App />
                <GlobalLoader />
              </BrowserRouter>
            </TransactionCategoriesProvider>
          </PaymentMethodsProvider>
        </SourcesProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
