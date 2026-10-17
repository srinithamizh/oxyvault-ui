import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FiCheck, FiEdit2, FiPlus } from "react-icons/fi";
import Button from "@/components/Button/Button";
import Card from "@/components/Card/Card";
import DeleteSourceDialog from "@/features/settings/sources/DeleteSourceDialog/DeleteSourceDialog";
import SourceFormModal from "@/features/settings/sources/SourceFormModal/SourceFormModal";
import SourceRow from "@/features/settings/sources/SourceRow/SourceRow";
import { useSources } from "@/hooks/useSources/useSources";
import type { Source } from "@/types/source";

type Dialog = { kind: "add" } | { kind: "edit"; source: Source } | { kind: "delete"; source: Source } | null;

export default function ManageSourcesPage() {
  const { t } = useTranslation();
  const { sources, addSource, updateSource, removeSource } = useSources();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [editing, setEditing] = useState(false);
  const close = () => setDialog(null);
  // Cash is the default source, so it always comes first.
  const ordered = [...sources].sort((a, b) => Number(b.type === "cash") - Number(a.type === "cash"));

  return (
    <Card aria-labelledby="sources-title">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="sources-title" className="text-[17px]">
            {t("sources.title")}
          </h2>
          <p className="mt-[5px] text-[10px] text-muted">{t("sources.subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={editing ? FiCheck : FiEdit2} aria-pressed={editing} onClick={() => setEditing((current) => !current)}>
            {t(editing ? "sources.done" : "sources.edit")}
          </Button>
          <Button icon={FiPlus} aria-label={t("sources.add")} onClick={() => setDialog({ kind: "add" })}>
            {t("transactionOptions.add")}
          </Button>
        </div>
      </div>

      {sources.length === 0 ? (
        <p className="py-8 text-center text-[11px] text-muted">{t("sources.empty")}</p>
      ) : (
        <ul aria-label={t("sources.listLabel")} className="divide-y divide-border">
          {ordered.map((source) => (
            <SourceRow
              key={source.id}
              source={source}
              editing={editing}
              onEdit={(value) => setDialog({ kind: "edit", source: value })}
              onDelete={(value) => setDialog({ kind: "delete", source: value })}
            />
          ))}
        </ul>
      )}

      {dialog?.kind === "add" && (
        <SourceFormModal
          onClose={close}
          onSave={(input) => {
            addSource(input);
            close();
          }}
        />
      )}
      {dialog?.kind === "edit" && (
        <SourceFormModal
          source={dialog.source}
          onClose={close}
          onSave={(input) => {
            updateSource(dialog.source.id, input);
            close();
          }}
        />
      )}
      {dialog?.kind === "delete" && (
        <DeleteSourceDialog
          name={dialog.source.name}
          onCancel={close}
          onConfirm={() => {
            removeSource(dialog.source.id);
            close();
          }}
        />
      )}
    </Card>
  );
}
