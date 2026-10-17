import { render, screen } from "@testing-library/react";
import Avatar from "./Avatar";
import { getInitials } from "./getInitials";

describe("Avatar", () => {
  it.each([
    ["Arjun Kumar", "AK"],
    ["meera", "M"],
    ["  Dev   Patel  ", "DP"],
    ["Mary Jane Watson", "MJ"],
  ])("derives initials for %s", (name, initials) => {
    expect(getInitials(name)).toBe(initials);
  });

  it("renders the initials", () => {
    render(<Avatar name="Arjun Kumar" />);
    expect(screen.getByText("AK")).toBeInTheDocument();
  });
});
