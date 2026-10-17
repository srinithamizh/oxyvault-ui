import type { TFunction } from "i18next";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import Button from "@/components/Button/Button";
import Checkbox from "@/components/Checkbox/Checkbox";
import PasswordField from "@/components/PasswordField/PasswordField";
import TextField from "@/components/TextField/TextField";
import PasswordStrengthMeter from "@/features/auth/PasswordStrengthMeter/PasswordStrengthMeter";
import { useAuth } from "@/hooks/useAuth/useAuth";
import { MIN_PASSWORD_LENGTH, validateEmail } from "@/features/auth/validation/validation";
import AuthHeading from "@/layout/AuthHeading/AuthHeading";
import { AuthError } from "@/services/authService/authService";
import type { FieldErrors } from "@/types/forms";

type RegisterField = "name" | "email" | "password" | "confirmPassword" | "terms";

interface RegisterValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

function validate(values: RegisterValues, t: TFunction): FieldErrors<RegisterField> {
  return {
    name: values.name.trim() ? undefined : t("auth.errors.nameRequired"),
    email: validateEmail(values.email, t),
    password: !values.password
      ? t("auth.errors.createPassword")
      : values.password.length < MIN_PASSWORD_LENGTH
        ? t("auth.errors.passwordTooShort", { min: MIN_PASSWORD_LENGTH })
        : undefined,
    confirmPassword: !values.confirmPassword
      ? t("auth.errors.confirmRequired")
      : values.confirmPassword !== values.password
        ? t("auth.errors.passwordMismatch")
        : undefined,
    terms: values.terms ? undefined : t("auth.errors.termsRequired"),
  };
}

export default function RegisterPage() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<FieldErrors<RegisterField>>({});
  const [formError, setFormError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(undefined);

    const nextErrors = validate({ name, email, password, confirmPassword, terms }, t);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSubmitting(true);
    try {
      // On success the session changes and <GuestOnly> redirects away from this page.
      await register({ name, email, password });
    } catch (error) {
      setFormError(error instanceof AuthError ? t(`auth.errors.${error.code}`) : t("auth.errors.generic"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <AuthHeading title={t("auth.register.title")} subtitle={t("auth.register.subtitle")} />

      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        {formError && (
          <p role="alert" className="rounded-[9px] bg-danger-soft px-3 py-2.5 text-[11px] text-danger">
            {formError}
          </p>
        )}

        <TextField
          label={t("auth.fields.fullName")}
          autoComplete="name"
          placeholder={t("auth.fields.fullNamePlaceholder")}
          value={name}
          error={errors.name}
          onChange={(event) => setName(event.target.value)}
        />
        <TextField
          label={t("auth.fields.email")}
          type="email"
          autoComplete="email"
          placeholder={t("auth.fields.emailPlaceholder")}
          value={email}
          error={errors.email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <PasswordField
          label={t("auth.fields.password")}
          autoComplete="new-password"
          placeholder={t("auth.fields.passwordPlaceholder")}
          value={password}
          error={errors.password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <PasswordField
          label={t("auth.fields.confirmPassword")}
          autoComplete="new-password"
          placeholder={t("auth.fields.passwordPlaceholder")}
          value={confirmPassword}
          error={errors.confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />

        <PasswordStrengthMeter password={password} />

        <Checkbox
          label={t("auth.register.terms")}
          checked={terms}
          error={errors.terms}
          onChange={(event) => setTerms(event.target.checked)}
        />

        <Button type="submit" className="mt-1 w-full" disabled={submitting}>
          {t("auth.register.submit")}
        </Button>
      </form>

      <p className="mt-5 text-center text-[10px] text-muted">
        {t("auth.register.haveAccount")}{" "}
        <Link to="/login" className="font-semibold text-accent-dark">
          {t("auth.register.signInLink")}
        </Link>
      </p>
    </>
  );
}
