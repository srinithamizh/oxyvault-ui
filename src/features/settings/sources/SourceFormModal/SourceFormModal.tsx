import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { FiRefreshCw } from "react-icons/fi";
import Button from "@/components/Button/Button";
import Modal from "@/components/Modal/Modal";
import SegmentedControl from "@/components/SegmentedControl/SegmentedControl";
import TextField from "@/components/TextField/TextField";
import {
  draftFromSource,
  emptyDraft,
  FIELDS_BY_TYPE,
  validateDraft,
  type DraftField,
  type SourceDraft,
} from "@/features/settings/sources/sourceForm/sourceForm";
import { SOURCE_TYPES } from "@/features/settings/sources/sourceTypes/sourceTypes";
import type { FieldErrors } from "@/types/forms";
import type { Source, SourceInput, SourceType } from "@/types/source";

export interface SourceFormModalProps {
  /** The source being edited; omit to add a new one. */
  source?: Source;
  onSave: (input: SourceInput) => void | boolean | Promise<void | boolean>;
  onClose: () => void;
  error?: string | null;
}

const ADDABLE_TYPES = SOURCE_TYPES.filter(({ type }) => type !== "cash");

type TextDraftField = Exclude<DraftField, "accountType">;

const TEXT_FIELD_PROPS: Record<TextDraftField, { inputMode?: "decimal" | "numeric"; autoComplete?: string; maxLength?: number }> = {
  name: {},
  provider: {},
  lastFour: { inputMode: "numeric", autoComplete: "off", maxLength: 4 },
  balance: { inputMode: "decimal", autoComplete: "off" },
  creditLimit: { inputMode: "decimal", autoComplete: "off" },
  emi: { inputMode: "decimal", autoComplete: "off" },
  interestRate: { inputMode: "decimal", autoComplete: "off" },
};

export default function SourceFormModal({ source, onSave, onClose, error }: SourceFormModalProps) {
  const { t } = useTranslation();
  const editing = source !== undefined;
  const [type, setType] = useState<SourceType>(source?.type ?? "bank");
  const [draft, setDraft] = useState<SourceDraft>(source ? draftFromSource(source) : emptyDraft("bank"));
  const [errors, setErrors] = useState<FieldErrors<DraftField>>({});
  const [saving, setSaving] = useState(false);

  const chooseType = (next: SourceType) => {
    setType(next);
    setDraft(emptyDraft(next));
    setErrors({});
  };

  const setField = <K extends DraftField>(field: K, value: SourceDraft[K]) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (saving) return;
    const result = validateDraft(type, draft, t);
    setErrors(result.errors);
    if (result.input) {
      setSaving(true);
      try {
        await onSave(result.input);
      } finally {
        setSaving(false);
      }
    }
  };

  const labelFor = (field: DraftField): string => {
    switch (field) {
      case "name":
        return t(`sources.fields.${type}Name`);
      case "lastFour":
        return t(type === "card" ? "sources.fields.cardLastFour" : "sources.fields.bankLastFour");
      case "balance":
        return t("sources.fields.balance");
      default:
        return t(`sources.fields.${field}`);
    }
  };

  const renderField = (field: DraftField) => {
    if (field === "accountType") {
      return (
        <SegmentedControl
          key={field}
          label={labelFor(field)}
          name="account-type"
          value={draft.accountType}
          onChange={(value) => setField("accountType", value)}
          options={[
            { value: "savings", label: t("sources.accountTypes.savings") },
            { value: "current", label: t("sources.accountTypes.current") },
          ]}
        />
      );
    }
    return (
      <TextField
        key={field}
        label={labelFor(field)}
        value={draft[field]}
        error={errors[field]}
        onChange={(event) => setField(field, event.target.value)}
        {...TEXT_FIELD_PROPS[field]}
      />
    );
  };

  return (
    <Modal
      title={t(editing ? "sources.form.editTitle" : "sources.form.addTitle")}
      description={t(editing ? "sources.form.editDescription" : "sources.form.addDescription")}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {!editing && (
          <fieldset className="min-w-0">
            <legend className="mb-2 text-xs font-semibold text-muted">{t("sources.form.typeLegend")}</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {ADDABLE_TYPES.map(({ type: optionType, labelKey, icon: Icon }) => {
                const selected = type === optionType;
                return (
                  <label key={optionType} className="cursor-pointer">
                    <input
                      type="radio"
                      name="source-type"
                      value={optionType}
                      checked={selected}
                      onChange={() => chooseType(optionType)}
                      className="peer sr-only"
                    />
                    <span
                      className={`flex flex-col items-center gap-2 rounded-xl border-2 px-2 py-3 text-[13px] font-semibold peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[color-mix(in_srgb,var(--accent)_30%,transparent)] ${
                        selected ? "border-accent bg-accent-soft text-accent-dark" : "border-border text-muted"
                      }`}
                    >
                      <Icon size={22} aria-hidden="true" />
                      {t(labelKey)}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}

        <div className="grid grid-cols-2 gap-x-3 gap-y-4 max-[520px]:grid-cols-1">
          {FIELDS_BY_TYPE[type].map((field) => (
            <div key={field} className={field === "name" || (field === "balance" && type === "cash") ? "col-span-full" : ""}>
              {renderField(field)}
            </div>
          ))}
        </div>

        {error && <p role="alert" className="text-[11px] text-danger">{error}</p>}

        <div className="mt-1 flex justify-end gap-2 border-t border-border pt-[15px]">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={saving} icon={saving ? FiRefreshCw : undefined}>
            {t(saving ? "common.loading" : editing ? "sources.form.save" : "sources.form.add")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
