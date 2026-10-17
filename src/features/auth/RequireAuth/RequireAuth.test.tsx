import { screen } from "@testing-library/react";
import { Route, Routes, useLocation } from "react-router";
import RequireAuth from "./RequireAuth";
import type { AuthUser } from "@/services/authService/authService";
import { renderWithProviders } from "@/test/renderWithProviders";

function LoginProbe() {
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  return <p>login page (from: {from ?? "none"})</p>;
}

function renderGuarded(user?: AuthUser | null) {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<LoginProbe />} />
      <Route element={<RequireAuth />}>
        <Route path="/secret" element={<p>secret content</p>} />
      </Route>
    </Routes>,
    { route: "/secret?tab=1", user },
  );
}

describe("RequireAuth", () => {
  it("renders the protected route for a signed-in user", () => {
    renderGuarded();
    expect(screen.getByText("secret content")).toBeInTheDocument();
  });

  it("redirects a signed-out user to /login and remembers where they were going", () => {
    renderGuarded(null);
    expect(screen.queryByText("secret content")).not.toBeInTheDocument();
    expect(screen.getByText("login page (from: /secret?tab=1)")).toBeInTheDocument();
  });
});
