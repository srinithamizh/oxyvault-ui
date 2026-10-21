import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { isValidUsername } from "@/features/auth/validation/validation";
import { queryKeys } from "@/data/queryClient";
import { checkUsernameAvailable } from "@/services/authService/authService";

export type UsernameAvailability = "idle" | "checking" | "available" | "taken" | "error";

export const USERNAME_CHECK_DELAY_MS = 400;

export function useUsernameAvailability(username: string): UsernameAvailability {
  const candidate = username.trim();
  const valid = isValidUsername(candidate);
  const [debouncedCandidate, setDebouncedCandidate] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedCandidate(candidate), USERNAME_CHECK_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [candidate]);

  const availabilityQuery = useQuery({
    queryKey: queryKeys.usernameAvailability(candidate),
    queryFn: ({ signal }) => checkUsernameAvailable(candidate, signal),
    enabled: valid && candidate === debouncedCandidate,
    staleTime: 30_000,
    meta: { showGlobalLoader: false },
  });

  if (!valid) return "idle";
  if (candidate !== debouncedCandidate || availabilityQuery.isPending || availabilityQuery.isFetching) {
    return "checking";
  }
  if (availabilityQuery.isError) return "error";
  if (availabilityQuery.data === undefined) return "checking";
  return availabilityQuery.data ? "available" : "taken";
}
