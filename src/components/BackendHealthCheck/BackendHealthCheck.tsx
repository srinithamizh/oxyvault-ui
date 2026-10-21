import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiRefreshCw, FiServer } from "react-icons/fi";
import Button from "@/components/Button/Button";
import IconButton from "@/components/IconButton/IconButton";
import Modal from "@/components/Modal/Modal";
import Spinner from "@/components/Spinner/Spinner";
import { checkBackendHealth } from "@/services/healthService/healthService";

const CHECK_WINDOW_MS = 60_000;
const RETRY_INTERVAL_MS = 2_000;
const SUCCESS_DISMISS_MS = 1_200;

type CheckStatus = "checking" | "failed" | "success";

function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }
    const finish = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", finish);
      resolve();
    };
    const timer = window.setTimeout(finish, ms);
    signal.addEventListener("abort", finish, { once: true });
  });
}

export default function BackendHealthCheck() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [run, setRun] = useState(0);
  const [status, setStatus] = useState<CheckStatus>("checking");
  const [secondsLeft, setSecondsLeft] = useState(60);
  const controllerRef = useRef<AbortController | null>(null);
  const dismissTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();
    controllerRef.current = controller;
    const deadline = Date.now() + CHECK_WINDOW_MS;
    const countdown = window.setInterval(() => {
      setSecondsLeft(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    }, 250);

    const checkUntilDeadline = async () => {
      while (Date.now() < deadline && !controller.signal.aborted) {
        try {
          await checkBackendHealth(controller.signal);
          if (Date.now() <= deadline && !controller.signal.aborted) {
            setStatus("success");
            dismissTimerRef.current = window.setTimeout(() => setOpen(false), SUCCESS_DISMISS_MS);
            return;
          }
        } catch {
          if (controller.signal.aborted) return;
        }

        const timeRemaining = deadline - Date.now();
        if (timeRemaining > 0) await wait(Math.min(RETRY_INTERVAL_MS, timeRemaining), controller.signal);
      }

      if (!controller.signal.aborted) {
        setSecondsLeft(0);
        setStatus("failed");
      }
    };

    void checkUntilDeadline();

    return () => {
      controller.abort();
      controllerRef.current = null;
      window.clearInterval(countdown);
    };
  }, [open, run]);

  const startCheck = () => {
    if (dismissTimerRef.current !== null) window.clearTimeout(dismissTimerRef.current);
    setStatus("checking");
    setSecondsLeft(60);
    setRun((current) => current + 1);
  };

  const close = () => {
    controllerRef.current?.abort();
    if (dismissTimerRef.current !== null) window.clearTimeout(dismissTimerRef.current);
    setOpen(false);
  };

  return (
    <>
      <div className="mb-1 flex justify-center">
        <IconButton
          icon={FiServer}
          label={t("healthCheck.open")}
          title={t("healthCheck.open")}
          onClick={() => {
            startCheck();
            setOpen(true);
          }}
        />
      </div>
      {open && (
        <Modal
          title={t("healthCheck.title")}
          description={t("healthCheck.description")}
          onClose={close}
        >
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            {status === "checking" ? (
              <>
                <Spinner size={28} />
                <p role="status" className="text-sm text-muted">
                  {t("healthCheck.waiting", { seconds: secondsLeft })}
                </p>
              </>
            ) : status === "success" ? (
              <p role="status" className="font-semibold text-success-text">{t("healthCheck.success")}</p>
            ) : (
              <>
                <p role="alert" className="text-sm text-danger">{t("healthCheck.failure")}</p>
                <Button icon={FiRefreshCw} onClick={startCheck}>{t("healthCheck.retry")}</Button>
              </>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
