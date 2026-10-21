import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BackendHealthCheck from "./BackendHealthCheck";
import { renderWithProviders } from "@/test/renderWithProviders";
import { checkBackendHealth } from "@/services/healthService/healthService";

vi.mock("@/services/healthService/healthService", () => ({
  checkBackendHealth: vi.fn(),
}));

describe("BackendHealthCheck", () => {
  beforeEach(() => {
    vi.mocked(checkBackendHealth).mockResolvedValue();
  });

  it("starts a health check from the discreet icon and dismisses after success", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BackendHealthCheck />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Check server connection" }));

    expect(checkBackendHealth).toHaveBeenCalledWith(expect.any(AbortSignal));
    expect(await screen.findByRole("status")).toHaveTextContent("All Good");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument(), { timeout: 2500 });
  });

  it("keeps checking when a health request fails", async () => {
    vi.mocked(checkBackendHealth).mockRejectedValue(new Error("unavailable"));
    const user = userEvent.setup();
    renderWithProviders(<BackendHealthCheck />);

    await user.click(screen.getByRole("button", { name: "Check server connection" }));

    expect(await screen.findByRole("status")).toHaveTextContent(/Waiting for the server/);
    expect(screen.getByText(/60 seconds remaining/)).toBeInTheDocument();
  });
});
