import { act, render, screen } from "@testing-library/react";
import GlobalLoader, { LOADER_DELAY_MS } from "./GlobalLoader";
import { apiRequest } from "@/services/apiClient/apiClient";
import { getPendingCount } from "@/services/loadingStore/loadingStore";

/** A fetch that stays pending until the test releases it. */
function holdFetch() {
  let release: (response: Response) => void = () => {};
  vi.stubGlobal(
    "fetch",
    () =>
      new Promise<Response>((resolve) => {
        release = resolve;
      }),
  );
  return {
    respond: (status = 200, body: unknown = true) => release(new Response(JSON.stringify(body), { status })),
  };
}

const flushDelay = () => act(() => vi.advanceTimersByTimeAsync(LOADER_DELAY_MS + 10));

describe("GlobalLoader", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("is hidden when nothing is loading", async () => {
    render(<GlobalLoader />);
    await flushDelay();
    expect(screen.queryByTestId("global-loader")).not.toBeInTheDocument();
  });

  it("appears once a request has been pending for a moment, then disappears when it finishes", async () => {
    const backend = holdFetch();
    render(<GlobalLoader />);

    let request!: Promise<unknown>;
    act(() => {
      request = apiRequest("/anything");
    });
    expect(screen.queryByTestId("global-loader")).not.toBeInTheDocument(); // too quick to flash
    await flushDelay();
    expect(screen.getByRole("status")).toHaveTextContent("Loading…");

    await act(async () => {
      backend.respond();
      await request;
    });
    expect(screen.queryByTestId("global-loader")).not.toBeInTheDocument();
  });

  it("never flashes for a request that finishes quickly", async () => {
    const backend = holdFetch();
    render(<GlobalLoader />);
    let request!: Promise<unknown>;
    act(() => {
      request = apiRequest("/anything");
    });
    await act(async () => {
      backend.respond();
      await request;
    });
    await flushDelay();
    expect(screen.queryByTestId("global-loader")).not.toBeInTheDocument();
  });

  it("also clears when the request fails", async () => {
    const backend = holdFetch();
    render(<GlobalLoader />);
    let request!: Promise<unknown>;
    act(() => {
      request = apiRequest("/anything").catch(() => {});
    });
    await flushDelay();
    expect(screen.getByTestId("global-loader")).toBeInTheDocument();
    await act(async () => {
      backend.respond(500, {});
      await request;
    });
    expect(screen.queryByTestId("global-loader")).not.toBeInTheDocument();
    expect(getPendingCount()).toBe(0);
  });

  it("stays visible until every overlapping request has finished", async () => {
    let releases: Array<(response: Response) => void> = [];
    vi.stubGlobal("fetch", () => new Promise<Response>((resolve) => releases.push(resolve)));
    render(<GlobalLoader />);

    let first!: Promise<unknown>;
    let second!: Promise<unknown>;
    act(() => {
      first = apiRequest("/a");
      second = apiRequest("/b");
    });
    await flushDelay();
    expect(screen.getByTestId("global-loader")).toBeInTheDocument();

    await act(async () => {
      releases[0](new Response("true"));
      await first;
    });
    expect(screen.getByTestId("global-loader")).toBeInTheDocument();

    await act(async () => {
      releases[1](new Response("true"));
      await second;
    });
    expect(screen.queryByTestId("global-loader")).not.toBeInTheDocument();
    releases = [];
  });

  it("does not show for requests that opt out of the loader", async () => {
    const backend = holdFetch();
    render(<GlobalLoader />);
    let request!: Promise<unknown>;
    act(() => {
      request = apiRequest("/auth/validate-username", { showLoader: false });
    });
    await flushDelay();
    expect(screen.queryByTestId("global-loader")).not.toBeInTheDocument();
    await act(async () => {
      backend.respond();
      await request;
    });
  });
});
