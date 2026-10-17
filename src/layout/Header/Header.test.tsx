import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Header from "./Header";
import { renderWithProviders } from "@/test/renderWithProviders";

const user = { name: "Arjun Kumar", role: "Administrator" };

describe("Header", () => {
  it("toggles the theme from the header button", async () => {
    const userEv = userEvent.setup();
    renderWithProviders(<Header user={user} />);
    expect(document.documentElement).not.toHaveClass("dark");

    await userEv.click(screen.getByRole("button", { name: "Toggle theme" }));
    expect(document.documentElement).toHaveClass("dark");

    await userEv.click(screen.getByRole("button", { name: "Toggle theme" }));
    expect(document.documentElement).not.toHaveClass("dark");
  });

  it("renders notifications and the account menu, but no search box", () => {
    renderWithProviders(<Header user={user} />);
    expect(screen.getByRole("button", { name: "Notifications" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Account menu" })).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});
