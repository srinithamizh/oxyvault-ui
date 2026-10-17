import { render, screen } from "@testing-library/react";
import PageHeader from "./PageHeader";

describe("PageHeader", () => {
  it("renders the title as a level-one heading with its subtitle", () => {
    render(<PageHeader title="Reports" subtitle="Explore your cash flow." />);
    expect(screen.getByRole("heading", { level: 1, name: "Reports" })).toBeInTheDocument();
    expect(screen.getByText("Explore your cash flow.")).toBeInTheDocument();
  });

  it("renders the optional action", () => {
    render(<PageHeader title="Reports" subtitle="x" action={<button type="button">Export</button>} />);
    expect(screen.getByRole("button", { name: "Export" })).toBeInTheDocument();
  });
});
