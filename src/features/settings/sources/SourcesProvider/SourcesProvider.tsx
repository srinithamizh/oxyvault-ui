import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth/useAuth";
import { SourcesContext, type SourcesContextValue } from "@/hooks/useSources/useSources";
import {
  clearSourcesCache,
  createSource,
  deleteSource,
  getSources,
  updateSource as updateSourceRequest,
} from "@/services/sourcesService/sourcesService";
import type { Source } from "@/types/source";

/**
 * Keeps the authenticated user's sources loaded from the backend.
 */
export default function SourcesProvider({
  children,
  initialSources,
}: {
  children: ReactNode;
  initialSources?: Source[];
}) {
  const { user, isInitializing } = useAuth();
  const [sources, setSources] = useState<Source[]>(initialSources ?? []);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(
    initialSources === undefined ? null : user?.id ?? null,
  );
  const [loading, setLoading] = useState(initialSources === undefined && (isInitializing || user !== null));
  const [errorState, setErrorState] = useState<{ userId: string | null; type: "load" | "mutation" } | null>(null);
  const sourcesVersion = useRef(0);
  const error = errorState?.userId === (user?.id ?? null) ? errorState.type : null;
  const isLoading =
    initialSources === undefined &&
    ((isInitializing && loading) ||
      (user !== null && (loading || (loadedUserId !== user.id && errorState?.userId !== user.id))));

  const ensureCashSource = useCallback(async (currentSources: Source[]) => {
    if (currentSources.some((source) => source.type === "cash")) return currentSources;

    const cash = await createSource({ type: "cash", name: "Cash", balance: 0 });
    return [...currentSources, cash];
  }, []);

  const reloadSources = useCallback(async () => {
    if (!user) return;
    const requestVersion = ++sourcesVersion.current;
    setLoading(true);
    setErrorState(null);
    try {
      const result = await ensureCashSource(await getSources());
      if (requestVersion === sourcesVersion.current) {
        setSources(result);
        setLoadedUserId(user.id);
        setErrorState(null);
      }
    } catch (cause) {
      if (requestVersion === sourcesVersion.current) {
        setErrorState({ userId: user.id, type: "load" });
        console.error("Could not load sources.", cause instanceof Error ? cause.message : "Unexpected error");
      }
    } finally {
      if (requestVersion === sourcesVersion.current) setLoading(false);
    }
  }, [ensureCashSource, user]);

  useEffect(() => {
    if (initialSources !== undefined) return;
    if (isInitializing) return;
    if (!user) {
      sourcesVersion.current += 1;
      clearSourcesCache();
      return;
    }

    let active = true;
    const requestVersion = ++sourcesVersion.current;
    getSources()
      .then(async (result) => {
        if (!active || requestVersion !== sourcesVersion.current) return;
        const withCash = await ensureCashSource(result);
        if (active && requestVersion === sourcesVersion.current) {
          setSources(withCash);
          setLoadedUserId(user.id);
          setErrorState(null);
        }
      })
      .catch((cause: unknown) => {
        if (!active || requestVersion !== sourcesVersion.current) return;
        setErrorState({ userId: user.id, type: "load" });
        console.error("Could not load sources.", cause instanceof Error ? cause.message : "Unexpected error");
      })
      .finally(() => {
        if (active && requestVersion === sourcesVersion.current) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [initialSources, isInitializing, user, ensureCashSource]);

  const add = useCallback(async (input: Parameters<typeof createSource>[0]) => {
    setErrorState(null);
    if (input.type === "cash") {
      setErrorState({ userId: user?.id ?? null, type: "mutation" });
      console.error("Could not create cash source: cash is managed automatically.");
      return false;
    }
    try {
      const created = await createSource(input);
      sourcesVersion.current += 1;
      setSources((current) => [...current, created]);
      setLoadedUserId(user?.id ?? null);
      setLoading(false);
      setErrorState(null);
      return true;
    } catch (cause) {
      setErrorState({ userId: user?.id ?? null, type: "mutation" });
      console.error("Could not create source.", cause instanceof Error ? cause.message : "Unexpected error");
      return false;
    }
  }, [user]);

  const update = useCallback(async (id: string, input: Parameters<typeof updateSourceRequest>[1]) => {
    setErrorState(null);
    const source = sources.find((item) => item.id === id);
    if (
      source?.type === "cash" &&
      (input.type !== "cash" ||
        input.name !== source.name ||
        Object.keys(input).some((field) => !["type", "name", "balance"].includes(field)))
    ) {
      setErrorState({ userId: user?.id ?? null, type: "mutation" });
      console.error("Could not update cash source: only its balance can be changed.");
      return false;
    }
    try {
      const updated = await updateSourceRequest(id, input);
      sourcesVersion.current += 1;
      setSources((current) => current.map((source) => (source.id === id ? updated : source)));
      setLoadedUserId(user?.id ?? null);
      setLoading(false);
      setErrorState(null);
      return true;
    } catch (cause) {
      setErrorState({ userId: user?.id ?? null, type: "mutation" });
      console.error("Could not update source.", cause instanceof Error ? cause.message : "Unexpected error");
      return false;
    }
  }, [sources, user]);

  const remove = useCallback(async (id: string) => {
    setErrorState(null);
    if (sources.find((source) => source.id === id)?.type === "cash") {
      setErrorState({ userId: user?.id ?? null, type: "mutation" });
      console.error("Could not delete cash source: cash sources cannot be deleted.");
      return false;
    }
    try {
      await deleteSource(id);
      sourcesVersion.current += 1;
      setSources((current) => current.filter((source) => source.id !== id));
      setLoadedUserId(user?.id ?? null);
      setLoading(false);
      setErrorState(null);
      return true;
    } catch (cause) {
      setErrorState({ userId: user?.id ?? null, type: "mutation" });
      console.error("Could not delete source.", cause instanceof Error ? cause.message : "Unexpected error");
      return false;
    }
  }, [sources, user]);

  const value = useMemo<SourcesContextValue>(
    () => ({
      sources: initialSources !== undefined || (user !== null && loadedUserId === user.id) ? sources : [],
      loading: isLoading,
      error,
      reloadSources,
      addSource: add,
      updateSource: update,
      removeSource: remove,
    }),
    [sources, initialSources, user, loadedUserId, isLoading, error, reloadSources, add, update, remove],
  );

  return <SourcesContext.Provider value={value}>{children}</SourcesContext.Provider>;
}
