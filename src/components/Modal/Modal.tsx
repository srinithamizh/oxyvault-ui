import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { FiX } from "react-icons/fi";
import IconButton from "@/components/IconButton/IconButton";

export interface ModalProps {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ title, description, onClose, children }: ModalProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, []);

  return createPortal(
    <div
      data-testid="modal-backdrop"
      className="fixed inset-0 z-[100] grid place-items-center bg-[rgba(6,15,12,0.58)] p-5 backdrop-blur-[4px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className="w-[min(550px,100%)] rounded-[17px] bg-surface p-[22px] shadow-[0_25px_70px_rgba(0,0,0,0.25)] outline-none max-[520px]:p-[18px]"
      >
        <div className="mb-5 flex justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-[19px]">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-[5px] text-[10px] text-muted">
                {description}
              </p>
            )}
          </div>
          <IconButton icon={FiX} label={t("common.close")} onClick={onClose} />
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
