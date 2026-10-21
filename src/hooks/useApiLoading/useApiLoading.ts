import { useSyncExternalStore } from "react";
import { getPendingCount, subscribeToLoading } from "@/services/loadingStore/loadingStore";

/** True while any loader-tracked API request is waiting for the backend. */
export function useApiLoading(): boolean {
  return useSyncExternalStore(subscribeToLoading, () => getPendingCount() > 0);
}
