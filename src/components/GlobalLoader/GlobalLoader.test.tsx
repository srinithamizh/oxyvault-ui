import { act, fireEvent, render, screen } from "@testing-library/react";
import { QueryClientProvider, useMutation } from "@tanstack/react-query";
import GlobalLoader, { LOADER_DELAY_MS } from "./GlobalLoader";
import { apiRequest } from "@/services/apiClient/apiClient";
import { createQueryClient } from "@/data/queryClient";

function LoaderProbe() {
  const request = useMutation({ mutationFn: () => apiRequest("/anything") });
  const backgroundRequest = useMutation({
    mutationFn: () => apiRequest("/background"),
    meta: { showGlobalLoader: false },
  });
  return (
    <>
      <button onClick={() => request.mutate()}>Start request</button>
      <button onClick={() => { request.mutate(); request.mutate(); }}>Start overlapping requests</button>
      <button onClick={() => backgroundRequest.mutate()}>Start background request</button>
    </>
  );
}

function renderLoader() {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <GlobalLoader />
      <LoaderProbe />
    </QueryClientProvider>,
  );
}

function holdFetch() {
  const releases: Array<(response: Response) => void> = [];
  vi.stubGlobal(
    "fetch",
    () =>
      new Promise<Response>((resolve) => {
        releases.push(resolve);
      }),
  );
  return {
    respond: async (index = 0, status = 200, body: unknown = true) => {
      for (let attempt = 0; attempt < 20 && !releases[index]; attempt += 1) {
        await Promise.resolve();
      }
      const release = releases[index];
      if (!release) throw new Error("The request has not started.");
      release(new Response(JSON.stringify(body), { status }));
    },
  };
}

const flushDelay = () => act(() => vi.advanceTimersByTimeAsync(LOADER_DELAY_MS + 10));

describe("GlobalLoader", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("is hidden when nothing is loading", async () => {
    renderLoader();
    await flushDelay();
    expect(screen.queryByTestId("global-loader")).not.toBeInTheDocument();
  });

  it("appears after a mutation is pending and disappears when it finishes", async () => {
    const backend = holdFetch();
    renderLoader();

    fireEvent.click(screen.getByRole("button", { name: "Start request" }));
    expect(screen.queryByTestId("global-loader")).not.toBeInTheDocument();
    await flushDelay();
    expect(screen.getByRole("status")).toHaveTextContent("Loading…");

    await act(async () => {
      await backend.respond();
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.queryByTestId("global-loader")).not.toBeInTheDocument();
  });

  it("never flashes for a request that finishes quickly", async () => {
    const backend = holdFetch();
    renderLoader();
    fireEvent.click(screen.getByRole("button", { name: "Start request" }));
    await act(async () => {
      await backend.respond();
      await vi.advanceTimersByTimeAsync(0);
    });
    await flushDelay();
    expect(screen.queryByTestId("global-loader")).not.toBeInTheDocument();
  });

  it("stays visible until every overlapping request finishes", async () => {
    const backend = holdFetch();
    renderLoader();
    fireEvent.click(screen.getByRole("button", { name: "Start overlapping requests" }));
    await flushDelay();
    expect(screen.getByTestId("global-loader")).toBeInTheDocument();

    await act(async () => {
      await backend.respond(0);
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.getByTestId("global-loader")).toBeInTheDocument();

    await act(async () => {
      await backend.respond(1);
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.queryByTestId("global-loader")).not.toBeInTheDocument();
  });

  it("does not show for a mutation marked as background", async () => {
    const backend = holdFetch();
    renderLoader();
    fireEvent.click(screen.getByRole("button", { name: "Start background request" }));
    await flushDelay();
    expect(screen.queryByTestId("global-loader")).not.toBeInTheDocument();
    await act(async () => {
      await backend.respond();
      await vi.advanceTimersByTimeAsync(0);
    });
  });
});
