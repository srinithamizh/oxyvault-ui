import { screen, within } from "@testing-library/react";
import App from "@/App";
import { PORTFOLIO_URL } from "@/app/links";
import { renderWithProviders } from "@/test/renderWithProviders";

describe("SiteFooter", () => {
  it.each([
    ["/login", null],
    ["/register", null],
    ["/settings/appearance", undefined],
    ["/settings/sources", undefined],
  ])("shows the copyright and a portfolio link on %s", (route, user) => {
    renderWithProviders(<App />, { route, user });
    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveTextContent(`© ${new Date().getFullYear()} OxyVault. All rights reserved.`);
    expect(footer).toHaveTextContent("Developed by Thamizharasan Srinivasan");
    const link = within(footer).getByRole("link", { name: "Thamizharasan Srinivasan" });
    expect(link).toHaveAttribute("href", PORTFOLIO_URL);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  it("is not shown on other pages", () => {
    renderWithProviders(<App />, { route: "/dashboard" });
    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
  });
});
