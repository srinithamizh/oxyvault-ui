import { createContext, useContext } from "react";
import type { Source, SourceInput } from "@/types/source";

export interface SourcesContextValue {
  sources: Source[];
  loading: boolean;
  error: "load" | "mutation" | null;
  reloadSources: () => Promise<void>;
  addSource: (input: SourceInput) => Promise<boolean>;
  updateSource: (id: string, input: SourceInput) => Promise<boolean>;
  removeSource: (id: string) => Promise<boolean>;
}

export const SourcesContext = createContext<SourcesContextValue | null>(null);

export function useSources(): SourcesContextValue {
  const context = useContext(SourcesContext);
  if (!context) {
    throw new Error("useSources must be used inside <SourcesProvider>");
  }
  return context;
}
