import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LogoutDialog from "./LogoutDialog";

describe("LogoutDialog", () => {
  it("asks for confirmation", () => {
    render(<LogoutDialog onCancel={() => {}} onConfirm={() => {}} />);
    const dialog = screen.getByRole("dialog", { name: "Log out of OxyVault?" });
    expect(dialog).toHaveAccessibleDescription(/sign in again/);
  });

  it("confirms with the Log out button", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<LogoutDialog onCancel={onCancel} onConfirm={onConfirm} />);
    await user.click(screen.getByRole("button", { name: "Log out" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it.each([
    ["the Cancel button", (user: ReturnType<typeof userEvent.setup>) => user.click(screen.getByRole("button", { name: "Cancel" }))],
    ["Escape", (user: ReturnType<typeof userEvent.setup>) => user.keyboard("{Escape}")],
  ])("cancels with %s", async (_label, act) => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<LogoutDialog onCancel={onCancel} onConfirm={onConfirm} />);
    await act(user);
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
