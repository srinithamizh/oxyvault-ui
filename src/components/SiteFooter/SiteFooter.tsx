import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import { PORTFOLIO_URL } from "@/app/links";

/** Copyright and author credit, shown on the auth pages and the Settings page. */
export default function SiteFooter({ className = "", children }: { className?: string; children?: ReactNode }) {
  const { t } = useTranslation();

  return (
    <footer className={`text-center text-[10px] leading-relaxed text-muted ${className}`.trim()}>
      {children}
      <p>{t("footer.copyright", { year: new Date().getFullYear() })}</p>
      <p className="text-fg">
        {t("footer.developedBy")}{" "}
        <a
          href={PORTFOLIO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-accent-dark underline-offset-2 hover:underline"
        >
          {t("footer.developerName")}
        </a>
      </p>
    </footer>
  );
}
