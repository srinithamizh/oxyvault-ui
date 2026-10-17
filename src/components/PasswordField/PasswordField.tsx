import { useState } from "react";
import { useTranslation } from "react-i18next";
import TextField, { type TextFieldProps } from "@/components/TextField/TextField";

export type PasswordFieldProps = Omit<TextFieldProps, "type" | "endAdornment">;

export default function PasswordField(props: PasswordFieldProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      {...props}
      type={visible ? "text" : "password"}
      endAdornment={
        <button
          type="button"
          aria-pressed={visible}
          aria-label={visible ? t("common.hidePassword") : t("common.showPassword")}
          onClick={() => setVisible((value) => !value)}
          className="bg-transparent px-1.5 py-1 text-[9px] font-semibold text-accent-dark"
        >
          {visible ? t("common.hide") : t("common.show")}
        </button>
      }
    />
  );
}
