import { render, screen } from "@testing-library/react";
import Card from "./Card";

describe("Card", () => {
  it("renders children inside a section", () => {
    render(<Card aria-label="Summary">Total income</Card>);
    expect(screen.getByRole("region", { name: "Summary" })).toHaveTextContent("Total income");
  });

  it("applies the surface styling and merges additional class names", () => {
    render(
      <Card className="col-span-2" aria-label="Summary">
        x
      </Card>,
    );
    expect(screen.getByRole("region", { name: "Summary" })).toHaveClass("bg-surface", "rounded-2xl", "col-span-2");
  });
});
