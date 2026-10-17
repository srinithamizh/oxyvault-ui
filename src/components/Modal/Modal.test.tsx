import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Modal from "./Modal";

describe("Modal", () => {
  it("renders an accessible dialog with its title, description and content", () => {
    render(
      <Modal title="Add transaction" description="Add the details below." onClose={() => {}}>
        <p>form body</p>
      </Modal>,
    );
    const dialog = screen.getByRole("dialog", { name: "Add transaction" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleDescription("Add the details below.");
    expect(dialog).toHaveTextContent("form body");
  });

  it("moves focus into the dialog when opened", () => {
    render(
      <Modal title="Title" onClose={() => {}}>
        x
      </Modal>,
    );
    expect(screen.getByRole("dialog")).toHaveFocus();
  });

  it("renders into document.body, outside the React container", () => {
    const { container } = render(
      <Modal title="Title" onClose={() => {}}>
        x
      </Modal>,
    );
    expect(container).toBeEmptyDOMElement();
    expect(document.body).toContainElement(screen.getByRole("dialog"));
  });

  it("closes from the close button", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal title="Title" onClose={onClose}>
        x
      </Modal>,
    );
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal title="Title" onClose={onClose}>
        x
      </Modal>,
    );
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes when the backdrop is clicked but not when the dialog itself is", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal title="Title" onClose={onClose}>
        <p>inside</p>
      </Modal>,
    );
    await user.click(screen.getByText("inside"));
    expect(onClose).not.toHaveBeenCalled();

    await user.click(screen.getByTestId("modal-backdrop"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("returns focus to the previously focused element on close", () => {
    const trigger = document.createElement("button");
    document.body.append(trigger);
    trigger.focus();

    const { unmount } = render(
      <Modal title="Title" onClose={() => {}}>
        x
      </Modal>,
    );
    expect(trigger).not.toHaveFocus();
    unmount();
    expect(trigger).toHaveFocus();
    trigger.remove();
  });
});
