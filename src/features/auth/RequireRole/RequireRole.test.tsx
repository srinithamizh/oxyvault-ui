import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router";
import RequireRole from "./RequireRole";
import { renderWithProviders, testUser } from "@/test/renderWithProviders";
import { UserRole } from "@/types/user";

function renderGuarded(role: UserRole) {
  return renderWithProviders(
    <Routes>
      <Route path="/dashboard" element={<p>dashboard page</p>} />
      <Route element={<RequireRole roles={[UserRole.Admin]} />}>
        <Route path="/admin" element={<p>admin page</p>} />
      </Route>
    </Routes>,
    { route: "/admin", user: { ...testUser, role } },
  );
}

describe("RequireRole", () => {
  it("renders the nested routes for an allowed role", () => {
    renderGuarded(UserRole.Admin);
    expect(screen.getByText("admin page")).toBeInTheDocument();
  });

  it("redirects other roles to the dashboard", () => {
    renderGuarded(UserRole.User);
    expect(screen.queryByText("admin page")).not.toBeInTheDocument();
    expect(screen.getByText("dashboard page")).toBeInTheDocument();
  });
});
