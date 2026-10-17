import { useMemo, useState, type ReactNode } from "react";
import { seedSources } from "@/data/mockSources";
import { SourcesContext, type SourcesContextValue } from "@/hooks/useSources/useSources";
import type { Source } from "@/types/source";

let nextId = 1;
const createId = () => `s-new-${nextId++}`;

/**
 * Keeps the user's financial sources in memory, seeded with dummy data.
 * Replace the bodies of add/update/remove with API calls once the backend is ready.
 */
export default function SourcesProvider({
  children,
  initialSources = seedSources,
}: {
  children: ReactNode;
  initialSources?: Source[];
}) {
  const [sources, setSources] = useState<Source[]>(initialSources);

  const value = useMemo<SourcesContextValue>(
    () => ({
      sources,
      addSource: (input) => setSources((current) => [...current, { ...input, id: createId() } as Source]),
      updateSource: (id, input) =>
        setSources((current) => current.map((source) => (source.id === id ? ({ ...input, id } as Source) : source))),
      removeSource: (id) => setSources((current) => current.filter((source) => source.id !== id)),
    }),
    [sources],
  );

  return <SourcesContext.Provider value={value}>{children}</SourcesContext.Provider>;
}
