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
      subtitle = [
        source.accountType ? `${t(`sources.accountTypes.${source.accountType}`)} account` : "",
        source.lastFour ? `••${source.lastFour}` : "",
      ]
        .filter(Boolean)
        .join(" · ") || t("sources.summary.bankDefault");
      amount = formatCurrency(source.balance);
      break;
    case "card":
      subtitle = [
        t("sources.summary.card"),
        source.lastFour ? `••${source.lastFour}` : "",
        source.creditLimit !== undefined
          ? t("sources.summary.creditLimit", { limit: formatCurrency(source.creditLimit) })
          : "",
      ]
        .filter(Boolean)
        .join(" · ");
      amount = formatCurrency(source.balance);
      break;
    case "cash":
      subtitle = t("sources.summary.cash");
      amount = formatCurrency(source.balance);
      break;
    case "loan":
      subtitle = [
        source.provider ?? "",
        source.emi !== undefined ? t("sources.summary.emi", { emi: formatCurrency(source.emi) }) : "",
        source.interestRate !== undefined ? `${source.interestRate}% p.a.` : "",
      ]
        .filter(Boolean)
        .join(" · ") || t("sources.summary.loanDefault");
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
          {source.type === "cash" ? (
            <IconButton
              icon={FiEdit2}
              label={t("sources.row.editCashBalance")}
              onClick={() => onEdit(source)}
            />
          ) : (
            <IconButton icon={FiEdit2} label={t("sources.row.edit", { name: source.name })} onClick={() => onEdit(source)} />
          )}
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
