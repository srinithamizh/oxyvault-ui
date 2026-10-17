import { render, screen } from "@testing-library/react";
import Badge from "./Badge";

describe("Badge", () => {
  it("defaults to the neutral tone", () => {
    render(<Badge>UPI</Badge>);
    expect(screen.getByText("UPI")).toHaveAttribute("data-tone", "neutral");
  });

  it.each(["success", "danger", "warning", "accent"] as const)("applies the %s tone", (tone) => {
    render(<Badge tone={tone}>Label</Badge>);
    expect(screen.getByText("Label")).toHaveAttribute("data-tone", tone);
  });

  it("merges additional class names", () => {
    render(<Badge className="ml-auto">Admin</Badge>);
    expect(screen.getByText("Admin")).toHaveClass("ml-auto");
  });
});
