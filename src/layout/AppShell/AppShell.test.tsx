import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router";
import AppShell from "./AppShell";
import { renderWithProviders } from "@/test/renderWithProviders";

function renderShell(route = "/dashboard") {
  return renderWithProviders(
    <Routes>
      <Route element={<AppShell />}>
        <Route path="*" element={<p>page content</p>} />
      </Route>
    </Routes>,
    { route },
  );
}

describe("AppShell", () => {
  it("renders the routed page inside the main landmark", () => {
    renderShell();
    expect(within(screen.getByRole("main")).getByText("page content")).toBeInTheDocument();
  });

  it("composes the sidebar, header and mobile navigation", () => {
    renderShell();
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Mobile" })).toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("lets the sidebar collapse", async () => {
    const user = userEvent.setup();
    renderShell();
    await user.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(screen.getByRole("complementary")).toHaveAttribute("data-collapsed", "true");
  });
});
