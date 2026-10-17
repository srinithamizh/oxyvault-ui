import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import Button from "@/components/Button/Button";
import Checkbox from "@/components/Checkbox/Checkbox";
import PasswordField from "@/components/PasswordField/PasswordField";
import TextField from "@/components/TextField/TextField";
import { useAuth } from "@/hooks/useAuth/useAuth";
import { validateEmail } from "@/features/auth/validation/validation";
import AuthHeading from "@/layout/AuthHeading/AuthHeading";
import { AuthError } from "@/services/authService/authService";
import type { FieldErrors } from "@/types/forms";

type LoginField = "email" | "password";

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<FieldErrors<LoginField>>({});
  const [formError, setFormError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(undefined);

    const nextErrors: FieldErrors<LoginField> = {
      email: validateEmail(email, t),
      password: password ? undefined : t("auth.errors.passwordRequired"),
    };
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;

    setSubmitting(true);
    try {
      // On success the session changes and <GuestOnly> redirects away from this page.
      await login({ email, password });
    } catch (error) {
      setFormError(error instanceof AuthError ? t(`auth.errors.${error.code}`) : t("auth.errors.generic"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <AuthHeading title={t("auth.login.title")} subtitle={t("auth.login.subtitle")} />

      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        {formError && (
          <p role="alert" className="rounded-[9px] bg-danger-soft px-3 py-2.5 text-[11px] text-danger">
            {formError}
          </p>
        )}

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
          autoComplete="current-password"
          placeholder={t("auth.fields.passwordPlaceholder")}
          value={password}
          error={errors.password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <Checkbox
          label={t("auth.login.rememberMe")}
          checked={remember}
          onChange={(event) => setRemember(event.target.checked)}
        />

        <Button type="submit" className="mt-1 w-full" disabled={submitting}>
          {t("auth.login.submit")}
        </Button>
      </form>

      <p className="mt-5 text-center text-[10px] text-muted">
        {t("auth.login.newHere")}{" "}
        <Link to="/register" className="font-semibold text-accent-dark">
          {t("auth.login.createAccountLink")}
        </Link>
      </p>
    </>
  );
}
