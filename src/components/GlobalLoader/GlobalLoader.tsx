import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Spinner from "@/components/Spinner/Spinner";
import { useApiLoading } from "@/hooks/useApiLoading/useApiLoading";

/** Requests that finish faster than this never flash a loader. */
export const LOADER_DELAY_MS = 150;

/** Mounted only while a request is pending, so its delay timer restarts for every new wait. */
function PendingOverlay() {
  const { t } = useTranslation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), LOADER_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!ready) return null;

  return (
    <div
      data-testid="global-loader"
      className="fixed inset-0 z-[200] grid cursor-progress place-items-center bg-[rgba(6,15,12,0.35)] backdrop-blur-[1px]"
    >
      <div role="status" className="flex items-center gap-3 rounded-2xl bg-surface px-5 py-4 text-sm font-semibold shadow-card">
        <Spinner size={22} />
        {t("common.loading")}
      </div>
    </div>
  );
}

/** A full-screen loader shown while the app waits on the backend. It also blocks double submits. */
export default function GlobalLoader() {
  return useApiLoading() ? <PendingOverlay /> : null;
}
