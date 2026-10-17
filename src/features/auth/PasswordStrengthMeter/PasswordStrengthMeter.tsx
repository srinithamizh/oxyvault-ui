import { useTranslation } from "react-i18next";
import { getPasswordStrength, type StrengthScore } from "@/features/auth/passwordStrength/passwordStrength";

const barColor: Record<StrengthScore, string> = {
  0: "bg-border",
  1: "bg-danger",
  2: "bg-warning",
  3: "bg-accent",
  4: "bg-accent",
};

export default function PasswordStrengthMeter({ password }: { password: string }) {
  const { t } = useTranslation();
  const { score, labelKey } = getPasswordStrength(password);
  if (score === 0 || !labelKey) return null;

  return (
    <div className="-mt-[7px] flex items-center gap-1" data-score={score}>
      {[1, 2, 3, 4].map((step) => (
        <i key={step} className={`h-[3px] flex-1 rounded-sm ${step <= score ? barColor[score] : "bg-border"}`} />
      ))}
      <span role="status" className="ml-[5px] whitespace-nowrap text-[10px] text-accent-dark">
        {t(labelKey)}
      </span>
    </div>
  );
}
