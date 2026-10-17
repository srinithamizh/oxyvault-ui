import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MobileNav from "./MobileNav";
import { navItems } from "@/app/navigation";
import { renderWithProviders } from "@/test/renderWithProviders";

const getBar = () => screen.getByRole("navigation", { name: "Mobile" });

describe("MobileNav", () => {
  it("shows the first four destinations plus a More button", () => {
    renderWithProviders(<MobileNav />);
    const bar = getBar();
    expect(within(bar).getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual([
      "/dashboard",
      "/reports",
      "/scheduled",
      "/credits-debits",
    ]);
    expect(within(bar).getByRole("button", { name: "More" })).toBeInTheDocument();
  });

  it("uses the short Lending label for Credits / Debits", () => {
    renderWithProviders(<MobileNav />);
    expect(screen.getByRole("link", { name: "Lending" })).toHaveAttribute("href", "/credits-debits");
  });

  it("marks the current route as active", () => {
    renderWithProviders(<MobileNav />, { route: "/scheduled" });
    expect(screen.getByRole("link", { name: "Scheduled" })).toHaveAttribute("aria-current", "page");
  });

  describe("More menu", () => {
    it("is closed by default", () => {
      renderWithProviders(<MobileNav />);
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "More" })).toHaveAttribute("aria-expanded", "false");
    });

    it("lists every remaining destination when opened", async () => {
      const user = userEvent.setup();
      renderWithProviders(<MobileNav />);
      await user.click(screen.getByRole("button", { name: "More" }));

      expect(screen.getByRole("button", { name: "More" })).toHaveAttribute("aria-expanded", "true");
      const menu = screen.getByRole("menu", { name: "More pages" });
      const remaining = navItems.slice(4);
      expect(within(menu).getAllByRole("menuitem")).toHaveLength(remaining.length);
      expect(within(menu).getByRole("menuitem", { name: "Investments" })).toHaveAttribute("href", "/investments");
      expect(within(menu).queryByRole("menuitem", { name: "Settings" })).not.toBeInTheDocument();
      expect(within(menu).getByRole("menuitem", { name: /Admin Panel/ })).toHaveAttribute("href", "/admin");
      expect(within(menu).getByText("Admin")).toBeInTheDocument();
    });

    it("navigates and closes when an item is chosen", async () => {
      const user = userEvent.setup();
      renderWithProviders(<MobileNav />);
      await user.click(screen.getByRole("button", { name: "More" }));
      await user.click(screen.getByRole("menuitem", { name: "Investments" }));
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("closes on Escape and on an outside press", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <div>
          <MobileNav />
          <p>outside</p>
        </div>,
      );
      await user.click(screen.getByRole("button", { name: "More" }));
      await user.keyboard("{Escape}");
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "More" }));
      await user.click(screen.getByText("outside"));
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("highlights More when the current page lives inside it", () => {
      renderWithProviders(<MobileNav />, { route: "/admin" });
      expect(screen.getByRole("button", { name: "More" })).toHaveAttribute("data-active", "true");
    });

    it("does not highlight More on a page that is in the bar", () => {
      renderWithProviders(<MobileNav />, { route: "/reports" });
      expect(screen.getByRole("button", { name: "More" })).toHaveAttribute("data-active", "false");
    });

    it("marks the current page inside the menu", async () => {
      const user = userEvent.setup();
      renderWithProviders(<MobileNav />, { route: "/investments" });
      await user.click(screen.getByRole("button", { name: "More" }));
      expect(screen.getByRole("menuitem", { name: "Investments" })).toHaveAttribute("aria-current", "page");
    });
  });

  it("has no More button when every item fits in the bar", () => {
    renderWithProviders(<MobileNav items={navItems.slice(0, 5)} />);
    expect(within(getBar()).getAllByRole("link")).toHaveLength(5);
    expect(screen.queryByRole("button", { name: "More" })).not.toBeInTheDocument();
  });
});
