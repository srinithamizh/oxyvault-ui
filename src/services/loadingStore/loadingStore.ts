/** Counts the API requests currently waiting for a response, so the UI can show a loader. */
let pending = 0;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

export function startLoading() {
  pending += 1;
  notify();
}

export function stopLoading() {
  pending = Math.max(0, pending - 1);
  notify();
}

export const getPendingCount = () => pending;

export function subscribeToLoading(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Keeps the loader up for the whole of a multi-request task (e.g. login, which posts credentials and
 * then loads the profile), so it doesn't disappear and reappear between the requests.
 */
export async function withLoading<T>(task: () => Promise<T>): Promise<T> {
  startLoading();
  try {
    return await task();
  } finally {
    stopLoading();
  }
}
