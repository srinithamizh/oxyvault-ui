import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef } from "react";
import { useDismiss } from "./useDismiss";

function Harness({ active, onDismiss }: { active: boolean; onDismiss: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, active, onDismiss);
  return (
    <div>
      <div ref={ref}>
        <button type="button">inside</button>
      </div>
      <button type="button">outside</button>
    </div>
  );
}

describe("useDismiss", () => {
  it("dismisses on Escape", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<Harness active onDismiss={onDismiss} />);
    await user.keyboard("{Escape}");
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("dismisses on a pointer press outside the container", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<Harness active onDismiss={onDismiss} />);
    await user.click(screen.getByRole("button", { name: "outside" }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("ignores presses inside the container and other keys", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<Harness active onDismiss={onDismiss} />);
    await user.click(screen.getByRole("button", { name: "inside" }));
    await user.keyboard("a");
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("does nothing while inactive", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<Harness active={false} onDismiss={onDismiss} />);
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: "outside" }));
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("stops listening after unmount", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    const { unmount } = render(<Harness active onDismiss={onDismiss} />);
    unmount();
    await user.keyboard("{Escape}");
    expect(onDismiss).not.toHaveBeenCalled();
  });
});
