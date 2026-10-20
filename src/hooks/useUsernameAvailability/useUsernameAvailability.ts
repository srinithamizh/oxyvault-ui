import { useEffect, useRef, useState } from "react";
import { isValidUsername } from "@/features/auth/validation/validation";
import { checkUsernameAvailable } from "@/services/authService/authService";

export type UsernameAvailability = "idle" | "checking" | "available" | "taken" | "error";

/** How long the user must stop typing before the backend is asked. */
export const USERNAME_CHECK_DELAY_MS = 400;

type Result = { username: string; status: "available" | "taken" | "error" };

/**
 * Asks the backend whether a username is free. It only calls the API for a well-formed username that
 * differs from the last one it checked, and only after typing pauses, so keystrokes don't flood the server.
 */
export function useUsernameAvailability(username: string): UsernameAvailability {
  const candidate = username.trim();
  const valid = isValidUsername(candidate);
  const [result, setResult] = useState<Result | null>(null);
  const lastChecked = useRef<string | null>(null);

  useEffect(() => {
    if (!valid || candidate === lastChecked.current) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const free = await checkUsernameAvailable(candidate, controller.signal);
        lastChecked.current = candidate;
        setResult({ username: candidate, status: free ? "available" : "taken" });
      } catch {
        if (controller.signal.aborted) return;
        lastChecked.current = null; // allow a retry on the next edit
        setResult({ username: candidate, status: "error" });
      }
    }, USERNAME_CHECK_DELAY_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [candidate, valid]);

  if (!valid) return "idle";
  return result?.username === candidate ? result.status : "checking";
}
