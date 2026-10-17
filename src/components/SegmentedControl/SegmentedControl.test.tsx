import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SegmentedControl from "./SegmentedControl";

const options = [
  { value: "savings", label: "Savings" },
  { value: "current", label: "Current" },
] as const;

describe("SegmentedControl", () => {
  it("renders a labelled radio group with the selected option checked", () => {
    render(
      <SegmentedControl label="Account type" name="t" options={[...options]} value="current" onChange={() => {}} />,
    );
    expect(screen.getByRole("group", { name: "Account type" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Current" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Savings" })).not.toBeChecked();
  });

  it("reports the chosen value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SegmentedControl label="Account type" name="t" options={[...options]} value="savings" onChange={onChange} />);
    await user.click(screen.getByRole("radio", { name: "Current" }));
    expect(onChange).toHaveBeenCalledWith("current");
  });
});
