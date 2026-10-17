import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router";
import GuestOnly from "./GuestOnly";
import type { AuthUser } from "@/services/authService/authService";
import { renderWithProviders } from "@/test/renderWithProviders";

function renderGuest(user?: AuthUser | null) {
  return renderWithProviders(
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<p>login form</p>} />
      </Route>
      <Route path="/dashboard" element={<p>dashboard</p>} />
    </Routes>,
    { route: "/login", user },
  );
}

describe("GuestOnly", () => {
  it("renders the guest route for a signed-out user", () => {
    renderGuest(null);
    expect(screen.getByText("login form")).toBeInTheDocument();
  });

  it("sends a signed-in user to the dashboard", () => {
    renderGuest();
    expect(screen.queryByText("login form")).not.toBeInTheDocument();
    expect(screen.getByText("dashboard")).toBeInTheDocument();
  });
});
