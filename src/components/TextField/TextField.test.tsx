import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TextField from "./TextField";

describe("TextField", () => {
  it("associates the label with the input", async () => {
    const user = userEvent.setup();
    render(<TextField label="Email address" />);
    await user.type(screen.getByLabelText("Email address"), "a@b.co");
    expect(screen.getByLabelText("Email address")).toHaveValue("a@b.co");
  });

  it("shows an error, marks the input invalid and links them", () => {
    render(<TextField label="Email address" error="Enter a valid email address." />);
    const input = screen.getByLabelText("Email address");
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription("Enter a valid email address.");
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a valid email address.");
  });

  it("is valid and has no alert without an error", () => {
    render(<TextField label="Email address" />);
    expect(screen.getByLabelText("Email address")).toBeValid();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
