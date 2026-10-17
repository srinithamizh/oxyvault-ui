import { useTranslation } from "react-i18next";
import Button from "@/components/Button/Button";
import Modal from "@/components/Modal/Modal";

export interface LogoutDialogProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export default function LogoutDialog({ onCancel, onConfirm }: LogoutDialogProps) {
  const { t } = useTranslation();

  return (
    <Modal title={t("logoutDialog.title")} description={t("logoutDialog.description")} onClose={onCancel}>
      <div className="mt-5 flex justify-end gap-2 border-t border-border pt-[15px]">
        <Button variant="secondary" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {t("logoutDialog.confirm")}
        </Button>
      </div>
    </Modal>
  );
}
