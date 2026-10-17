import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PasswordField from "./PasswordField";

describe("PasswordField", () => {
  it("hides the password by default and toggles visibility", async () => {
    const user = userEvent.setup();
    render(<PasswordField label="Password" />);
    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(input).toHaveAttribute("type", "text");

    await user.click(screen.getByRole("button", { name: "Hide password" }));
    expect(input).toHaveAttribute("type", "password");
  });

  it("passes the error through to the field", () => {
    render(<PasswordField label="Password" error="Enter your password." />);
    expect(screen.getByLabelText("Password")).toHaveAccessibleDescription("Enter your password.");
  });
});
