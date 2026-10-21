import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App";
import "./i18n/i18n";
import GlobalLoader from "./components/GlobalLoader/GlobalLoader";
import AuthProvider from "./features/auth/AuthProvider/AuthProvider";
import ThemeProvider from "./theme/ThemeProvider/ThemeProvider";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "./data/queryClient";
import "./styles/global.css";

const queryClient = createQueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <App />
            <GlobalLoader />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
