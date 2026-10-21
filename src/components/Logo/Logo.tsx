import { useTranslation } from "react-i18next";
export interface LogoProps {
  showName?: boolean;
  className?: string;
}

export default function Logo({ showName = true, className = "" }: LogoProps) {
  const { t } = useTranslation();

  return (
    <div className={`flex items-center gap-2.5 whitespace-nowrap ${className}`.trim()}>
      <span className="grid size-[34px] flex-none place-items-center rounded-[11px] bg-[linear-gradient(145deg,var(--accent),var(--accent-strong))] text-white shadow-[0_5px_14px_color-mix(in_srgb,var(--accent)_25%,transparent)]">
        <img src="/oxyvault.svg" alt={t("app.name")} className="size-[24px]" />
      </span>
      {showName && <strong className="font-display text-xl font-bold">{t("app.name")}</strong>}
    </div>
  );
}
