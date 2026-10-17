import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FiBell } from "react-icons/fi";
import IconButton from "./IconButton";

describe("IconButton", () => {
  it("exposes its label as the accessible name", () => {
    render(<IconButton icon={FiBell} label="Notifications" />);
    expect(screen.getByRole("button", { name: "Notifications" })).toHaveAttribute("type", "button");
  });

  it("calls onClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<IconButton icon={FiBell} label="Notifications" onClick={onClick} />);
    await user.click(screen.getByRole("button", { name: "Notifications" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders children such as an indicator dot", () => {
    render(
      <IconButton icon={FiBell} label="Notifications">
        <i data-testid="dot" />
      </IconButton>,
    );
    expect(screen.getByTestId("dot")).toBeInTheDocument();
  });
});
