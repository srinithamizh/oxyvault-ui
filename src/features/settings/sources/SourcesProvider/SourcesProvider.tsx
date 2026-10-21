import { useEffect, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth/useAuth";
import { SourcesContext, type SourcesContextValue } from "@/hooks/useSources/useSources";
import {
  createSource,
  deleteSource,
  getSources,
  updateSource as updateSourceRequest,
} from "@/services/sourcesService/sourcesService";
import { queryKeys } from "@/data/queryClient";
import { getAccessToken } from "@/services/tokenStore/tokenStore";
import type { Source, SourceInput } from "@/types/source";

export default function SourcesProvider({
  children,
  initialSources,
  shouldLoad = true,
}: {
  children: ReactNode;
  initialSources?: Source[];
  shouldLoad?: boolean;
}) {
  const { user, isInitializing } = useAuth();
  const queryClient = useQueryClient();
  const [validationError, setValidationError] = useState(false);
  const queryKey = queryKeys.sources(user?.id ?? "anonymous");
  const sourcesQuery = useQuery({
    queryKey,
    queryFn: async () => {
      const sources = await getSources();
      if (sources.some((source) => source.type === "cash")) return sources;
      return [...sources, await createSource({ type: "cash", name: "Cash", balance: 0 })];
    },
    enabled: shouldLoad && !isInitializing && user !== null && Boolean(getAccessToken()),
    staleTime: Infinity,
    initialData: initialSources,
    meta: { requiresAuth: true },
  });

  const createMutation = useMutation({
    mutationFn: createSource,
    onSuccess: (created) => {
      queryClient.setQueryData<Source[]>(queryKey, (current) => [...(current ?? []), created]);
      return queryClient.invalidateQueries({ queryKey });
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: SourceInput }) => updateSourceRequest(id, input),
    onSuccess: (updated) => {
      queryClient.setQueryData<Source[]>(queryKey, (current) =>
        current?.map((source) => (source.id === updated.id ? updated : source)),
      );
      return queryClient.invalidateQueries({ queryKey });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteSource,
    onSuccess: (_result, id) => {
      queryClient.setQueryData<Source[]>(queryKey, (current) => current?.filter((source) => source.id !== id));
      return queryClient.invalidateQueries({ queryKey });
    },
  });
  const mutationFailed = createMutation.isError || updateMutation.isError || deleteMutation.isError;
  const error = sourcesQuery.isError ? "load" : mutationFailed || validationError ? "mutation" : null;

  useEffect(() => {
    if (sourcesQuery.error) {
      console.error(
        "Could not load sources.",
        sourcesQuery.error instanceof Error ? sourcesQuery.error.message : "Unexpected error",
      );
    }
  }, [sourcesQuery.error]);

  const resetMutationErrors = () => {
    setValidationError(false);
    createMutation.reset();
    updateMutation.reset();
    deleteMutation.reset();
  };

  const reloadSources = async () => {
    await sourcesQuery.refetch();
  };

  const add = async (input: SourceInput) => {
    resetMutationErrors();
    if (input.type === "cash") {
      setValidationError(true);
      console.error("Could not create cash source: cash is managed automatically.");
      return false;
    }
    try {
      await createMutation.mutateAsync(input);
      return true;
    } catch (cause) {
      console.error("Could not create source.", cause instanceof Error ? cause.message : "Unexpected error");
      return false;
    }
  };

  const update = async (id: string, input: SourceInput) => {
    resetMutationErrors();
    const source = sourcesQuery.data?.find((item) => item.id === id);
    if (
      source?.type === "cash" &&
      (input.type !== "cash" ||
        input.name !== source.name ||
        Object.keys(input).some((field) => !["type", "name", "balance"].includes(field)))
    ) {
      setValidationError(true);
      console.error("Could not update cash source: only its balance can be changed.");
      return false;
    }
    try {
      await updateMutation.mutateAsync({ id, input });
      return true;
    } catch (cause) {
      console.error("Could not update source.", cause instanceof Error ? cause.message : "Unexpected error");
      return false;
    }
  };

  const remove = async (id: string) => {
    resetMutationErrors();
    if (sourcesQuery.data?.find((source) => source.id === id)?.type === "cash") {
      console.error("Could not delete cash source: cash sources cannot be deleted.");
      return false;
    }
    try {
      await deleteMutation.mutateAsync(id);
      return true;
    } catch (cause) {
      console.error("Could not delete source.", cause instanceof Error ? cause.message : "Unexpected error");
      return false;
    }
  };

  const value: SourcesContextValue = {
    sources: sourcesQuery.data ?? initialSources ?? [],
    loading: (user !== null && (isInitializing || sourcesQuery.isFetching)) && initialSources === undefined,
    error,
    reloadSources,
    addSource: add,
    updateSource: update,
    removeSource: remove,
  };

  return <SourcesContext.Provider value={value}>{children}</SourcesContext.Provider>;
}
