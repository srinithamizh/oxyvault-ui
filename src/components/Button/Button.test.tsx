import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from "./Button";

describe("Button", () => {
  it("renders its label and defaults to the primary variant", () => {
    render(<Button>Add transaction</Button>);
    expect(screen.getByRole("button", { name: "Add transaction" })).toHaveAttribute("data-variant", "primary");
  });

  it("applies the requested variant and extra class names", () => {
    render(
      <Button variant="danger" className="w-full">
        Log out
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Log out" });
    expect(button).toHaveAttribute("data-variant", "danger");
    expect(button).toHaveClass("bg-danger", "w-full");
  });

  it("renders an icon before the label when provided", () => {
    const TestIcon = () => <svg data-testid="icon" />;
    render(<Button icon={TestIcon}>Add</Button>);
    expect(screen.getByRole("button", { name: "Add" })).toContainElement(screen.getByTestId("icon"));
  });

  it("is type=button by default so it does not submit forms", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("type", "button");
  });

  it("calls onClick when clicked and not when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { rerender } = render(<Button onClick={onClick}>Go</Button>);
    await user.click(screen.getByRole("button", { name: "Go" }));
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(
      <Button onClick={onClick} disabled>
        Go
      </Button>,
    );
    await user.click(screen.getByRole("button", { name: "Go" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
