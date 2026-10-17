import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import Button from "@/components/Button/Button";
import Modal from "@/components/Modal/Modal";
import SegmentedControl from "@/components/SegmentedControl/SegmentedControl";
import TextField from "@/components/TextField/TextField";
import type { CategoryType } from "@/types/transactionOptions";

export type OptionVariant = "methods" | "categories";

export interface OptionValue {
  name: string;
  /** Only used by categories. */
  type?: CategoryType;
}

export interface OptionFormModalProps {
  variant: OptionVariant;
  /** The entry being edited; omit to add a new one. */
  option?: OptionValue;
  /** Names already in use by other entries in the same list. */
  takenNames: string[];
  onSave: (value: OptionValue) => void;
  onClose: () => void;
}

export default function OptionFormModal({ variant, option, takenNames, onSave, onClose }: OptionFormModalProps) {
  const { t } = useTranslation();
  const editing = option !== undefined;
  const [name, setName] = useState(option?.name ?? "");
  const [type, setType] = useState<CategoryType>(option?.type ?? "expense");
  const [error, setError] = useState<string>();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return setError(t("transactionOptions.errors.nameRequired"));
    if (takenNames.some((taken) => taken.toLowerCase() === trimmed.toLowerCase())) {
      return setError(t("transactionOptions.errors.nameTaken"));
    }
    onSave(variant === "categories" ? { name: trimmed, type } : { name: trimmed });
  };

  return (
    <Modal title={t(`transactionOptions.${variant}.${editing ? "editTitle" : "addTitle"}`)} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <TextField
          label={t(`transactionOptions.${variant}.nameLabel`)}
          value={name}
          error={error}
          autoComplete="off"
          onChange={(event) => {
            setName(event.target.value);
            setError(undefined);
          }}
        />
        {variant === "categories" && (
          <SegmentedControl
            label={t("transactionOptions.kindLegend")}
            name="category-kind"
            value={type}
            onChange={setType}
            options={[
              { value: "expense", label: t("transactionOptions.kinds.expense") },
              { value: "income", label: t("transactionOptions.kinds.income") },
            ]}
          />
        )}
        <div className="mt-1 flex justify-end gap-2 border-t border-border pt-[15px]">
          <Button variant="secondary" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button type="submit">{t(editing ? "transactionOptions.save" : "transactionOptions.add")}</Button>
        </div>
      </form>
    </Modal>
  );
}
