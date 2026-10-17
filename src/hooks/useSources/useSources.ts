import { createContext, useContext } from "react";
import type { Source, SourceInput } from "@/types/source";

export interface SourcesContextValue {
  sources: Source[];
  addSource: (input: SourceInput) => void;
  updateSource: (id: string, input: SourceInput) => void;
  removeSource: (id: string) => void;
}

export const SourcesContext = createContext<SourcesContextValue | null>(null);

export function useSources(): SourcesContextValue {
  const context = useContext(SourcesContext);
  if (!context) {
    throw new Error("useSources must be used inside <SourcesProvider>");
  }
  return context;
}
