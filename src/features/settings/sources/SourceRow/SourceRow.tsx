import { useTranslation } from "react-i18next";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import IconButton from "@/components/IconButton/IconButton";
import { getSourceTypeOption } from "@/features/settings/sources/sourceTypes/sourceTypes";
import type { Source } from "@/types/source";
import { formatCurrency } from "@/utils/formatCurrency/formatCurrency";

export interface SourceRowProps {
  source: Source;
  onEdit: (source: Source) => void;
  onDelete: (source: Source) => void;
  /** Edit and delete are only offered while the list is in edit mode. */
  editing: boolean;
}

export default function SourceRow({ source, onEdit, onDelete, editing }: SourceRowProps) {
  const { t } = useTranslation();
  const { icon: Icon } = getSourceTypeOption(source.type);

  let subtitle: string;
  let amount: string | null = null;
  switch (source.type) {
    case "bank":
      subtitle = t("sources.summary.bank", {
        accountType: t(`sources.accountTypes.${source.accountType}`),
        last4: source.lastFour,
      });
      amount = formatCurrency(source.balance);
      break;
    case "card":
      subtitle = t("sources.summary.creditCard", { last4: source.lastFour, limit: formatCurrency(source.creditLimit) });
      amount = formatCurrency(source.balance);
      break;
    case "cash":
      subtitle = t("sources.summary.cash");
      amount = formatCurrency(source.balance);
      break;
    case "loan":
      subtitle = t("sources.summary.loan", {
        provider: source.provider,
        emi: formatCurrency(source.emi),
        rate: source.interestRate,
      });
      amount = formatCurrency(source.balance);
      break;
  }

  return (
    <li data-testid={`source-${source.id}`} className="flex items-center gap-3 py-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-[11px] bg-accent-soft text-accent-dark">
        <Icon size={19} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <strong className="block truncate text-[13px]">{source.name}</strong>
        <span className="block truncate text-[10px] text-muted">{subtitle}</span>
      </div>
      {amount && (
        <div className="text-right">
          <strong className="block text-[13px]">{amount}</strong>
        </div>
      )}
      {editing && (
        <div className="flex shrink-0">
          <IconButton icon={FiEdit2} label={t("sources.row.edit", { name: source.name })} onClick={() => onEdit(source)} />
          {source.type !== "cash" && (
            <IconButton
              icon={FiTrash2}
              label={t("sources.row.delete", { name: source.name })}
              className="hover:text-danger"
              onClick={() => onDelete(source)}
            />
          )}
        </div>
      )}
    </li>
  );
}
