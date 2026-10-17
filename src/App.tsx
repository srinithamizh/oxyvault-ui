import type { ReactElement } from "react";
import { Navigate, Route, Routes } from "react-router";
import { pageRoutes, SETTINGS_PATH } from "@/app/navigation";
import { DEFAULT_SETTINGS_SECTION, settingsSections } from "@/app/settingsSections";
import GuestOnly from "@/features/auth/GuestOnly/GuestOnly";
import RequireAuth from "@/features/auth/RequireAuth/RequireAuth";
import AppShell from "@/layout/AppShell/AppShell";
import AuthLayout from "@/layout/AuthLayout/AuthLayout";
import LoginPage from "@/pages/LoginPage/LoginPage";
import PlaceholderPage from "@/pages/PlaceholderPage/PlaceholderPage";
import RegisterPage from "@/pages/RegisterPage/RegisterPage";
import SettingsPage from "@/pages/SettingsPage/SettingsPage";
import ManageSourcesPage from "@/pages/ManageSourcesPage/ManageSourcesPage";
import PaymentMethodsPage from "@/pages/PaymentMethodsPage/PaymentMethodsPage";
import TransactionCategoriesPage from "@/pages/TransactionCategoriesPage/TransactionCategoriesPage";
import AppearanceSettingsPage from "@/pages/AppearanceSettingsPage/AppearanceSettingsPage";

/** Absolute on purpose: a relative target inside a splat route would be appended to the unknown path and loop. */
const DEFAULT_SETTINGS_PATH = `${SETTINGS_PATH}/${DEFAULT_SETTINGS_SECTION}`;

/** Pages that are not built yet; each is replaced by a real page in its own phase. */
const placeholderRoutes = pageRoutes.filter(({ path }) => path !== SETTINGS_PATH);

const settingsPages: Record<string, ReactElement> = {
  appearance: <AppearanceSettingsPage />,
  sources: <ManageSourcesPage />,
  "payment-methods": <PaymentMethodsPage />,
  "transaction-categories": <TransactionCategoriesPage />,
};

export default function App() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          {placeholderRoutes.map(({ labelKey, path }) => (
            <Route key={path} path={path} element={<PlaceholderPage titleKey={labelKey} />} />
          ))}

          <Route path={SETTINGS_PATH} element={<SettingsPage />}>
            <Route index element={<Navigate to={DEFAULT_SETTINGS_PATH} replace />} />
            {settingsSections.map(({ path }) => (
              <Route key={path} path={path} element={settingsPages[path]} />
            ))}
            <Route path="*" element={<Navigate to={DEFAULT_SETTINGS_PATH} replace />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
