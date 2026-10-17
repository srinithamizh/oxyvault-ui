import { useTranslation } from "react-i18next";
import Button from "@/components/Button/Button";
import Modal from "@/components/Modal/Modal";

export interface DeleteOptionDialogProps {
  name: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteOptionDialog({ name, onCancel, onConfirm }: DeleteOptionDialogProps) {
  const { t } = useTranslation();

  return (
    <Modal
      title={t("transactionOptions.delete.title", { name })}
      description={t("transactionOptions.delete.description")}
      onClose={onCancel}
    >
      <div className="mt-5 flex justify-end gap-2 border-t border-border pt-[15px]">
        <Button variant="secondary" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {t("transactionOptions.delete.confirm")}
        </Button>
      </div>
    </Modal>
  );
}
