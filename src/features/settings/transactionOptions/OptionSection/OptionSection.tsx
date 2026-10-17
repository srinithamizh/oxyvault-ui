import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiCheck, FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import Badge from "@/components/Badge/Badge";
import Button from "@/components/Button/Button";
import Card from "@/components/Card/Card";
import IconButton from "@/components/IconButton/IconButton";
import DeleteOptionDialog from "@/features/settings/transactionOptions/DeleteOptionDialog/DeleteOptionDialog";
import OptionFormModal, {
  type OptionValue,
  type OptionVariant,
} from "@/features/settings/transactionOptions/OptionFormModal/OptionFormModal";

export interface OptionItem extends OptionValue {
  id: string;
}

export interface OptionSectionProps {
  variant: OptionVariant;
  items: OptionItem[];
  onAdd: (value: OptionValue) => void;
  onUpdate: (id: string, value: OptionValue) => void;
  onRemove: (id: string) => void;
}

type Dialog = { kind: "add" } | { kind: "edit"; item: OptionItem } | { kind: "delete"; item: OptionItem } | null;

/** A titled list of payment methods or categories with an Edit mode, like Manage Sources. */
export default function OptionSection({ variant, items, onAdd, onUpdate, onRemove }: OptionSectionProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [editing, setEditing] = useState(false);
  const close = () => setDialog(null);
  const takenNames = (excludeId?: string) => items.filter((item) => item.id !== excludeId).map((item) => item.name);

  return (
    <Card aria-labelledby={titleId}>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id={titleId} className="text-[17px]">
            {t(`transactionOptions.${variant}.title`)}
          </h2>
          <p className="mt-[5px] text-[10px] text-muted">{t(`transactionOptions.${variant}.subtitle`)}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={editing ? FiCheck : FiEdit2}
            aria-label={t(`transactionOptions.${variant}.${editing ? "done" : "edit"}`)}
            aria-pressed={editing}
            onClick={() => setEditing((current) => !current)}
          >
            {t(editing ? "transactionOptions.done" : "transactionOptions.edit")}
          </Button>
          <Button
            icon={FiPlus}
            aria-label={t(`transactionOptions.${variant}.add`)}
            onClick={() => setDialog({ kind: "add" })}
          >
            {t("transactionOptions.add")}
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="py-8 text-center text-[11px] text-muted">{t(`transactionOptions.${variant}.empty`)}</p>
      ) : (
        <ul aria-label={t(`transactionOptions.${variant}.listLabel`)} className="divide-y divide-border">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-2.5">
              <strong className="min-w-0 flex-1 truncate text-[13px]">{item.name}</strong>
              {item.type && (
                <Badge tone={item.type === "income" ? "success" : "danger"}>{t(`transactionOptions.kinds.${item.type}`)}</Badge>
              )}
              {editing && (
                <div className="flex shrink-0">
                  <IconButton
                    icon={FiEdit2}
                    label={t("transactionOptions.row.edit", { name: item.name })}
                    onClick={() => setDialog({ kind: "edit", item })}
                  />
                  <IconButton
                    icon={FiTrash2}
                    label={t("transactionOptions.row.delete", { name: item.name })}
                    className="hover:text-danger"
                    onClick={() => setDialog({ kind: "delete", item })}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {dialog?.kind === "add" && (
        <OptionFormModal
          variant={variant}
          takenNames={takenNames()}
          onClose={close}
          onSave={(value) => {
            onAdd(value);
            close();
          }}
        />
      )}
      {dialog?.kind === "edit" && (
        <OptionFormModal
          variant={variant}
          option={dialog.item}
          takenNames={takenNames(dialog.item.id)}
          onClose={close}
          onSave={(value) => {
            onUpdate(dialog.item.id, value);
            close();
          }}
        />
      )}
      {dialog?.kind === "delete" && (
        <DeleteOptionDialog
          name={dialog.item.name}
          onCancel={close}
          onConfirm={() => {
            onRemove(dialog.item.id);
            close();
          }}
        />
      )}
    </Card>
  );
}
