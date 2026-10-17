import { useTranslation } from "react-i18next";
import Button from "@/components/Button/Button";
import Modal from "@/components/Modal/Modal";

export interface DeleteSourceDialogProps {
  name: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteSourceDialog({ name, onCancel, onConfirm }: DeleteSourceDialogProps) {
  const { t } = useTranslation();

  return (
    <Modal title={t("sources.delete.title", { name })} description={t("sources.delete.description")} onClose={onCancel}>
      <div className="mt-5 flex justify-end gap-2 border-t border-border pt-[15px]">
        <Button variant="secondary" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {t("sources.delete.confirm")}
        </Button>
      </div>
    </Modal>
  );
}
