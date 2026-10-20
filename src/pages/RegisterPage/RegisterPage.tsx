import type { TFunction } from "i18next";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";
import Button from "@/components/Button/Button";
import Checkbox from "@/components/Checkbox/Checkbox";
import PasswordField from "@/components/PasswordField/PasswordField";
import TextField from "@/components/TextField/TextField";
import PasswordStrengthMeter from "@/features/auth/PasswordStrengthMeter/PasswordStrengthMeter";
import { useUsernameAvailability } from "@/hooks/useUsernameAvailability/useUsernameAvailability";
import { useAuth } from "@/hooks/useAuth/useAuth";
import { MIN_PASSWORD_LENGTH, validateEmail, validateUsername } from "@/features/auth/validation/validation";
import AuthHeading from "@/layout/AuthHeading/AuthHeading";
import { AuthError } from "@/services/authService/authService";
import type { FieldErrors } from "@/types/forms";

type RegisterField = "firstName" | "lastName" | "username" | "email" | "password" | "confirmPassword" | "terms";

interface RegisterValues {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

function validate(values: RegisterValues, t: TFunction): FieldErrors<RegisterField> {
  return {
    firstName: values.firstName.trim() ? undefined : t("auth.errors.firstNameRequired"),
    lastName: values.lastName.trim() ? undefined : t("auth.errors.lastNameRequired"),
    username: validateUsername(values.username, t),
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
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const availability = useUsernameAvailability(username);
  const usernameMessage = {
    idle: "",
    taken: "",
    checking: t("auth.username.checking"),
    available: t("auth.username.available"),
    error: t("auth.username.checkFailed"),
  }[availability];
  const [errors, setErrors] = useState<FieldErrors<RegisterField>>({});
  const [formError, setFormError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(undefined);

    const nextErrors = validate({ firstName, lastName, username, email, password, confirmPassword, terms }, t);
    if (!nextErrors.username && availability === "taken") nextErrors.username = t("auth.errors.usernameTaken");
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSubmitting(true);
    try {
      await register({ firstName, lastName, username, email, password });
      // The account exists but isn't signed in (no token from the backend): continue at the login page.
      navigate("/login", { replace: true, state: { registered: true, identifier: username.trim() } });
      return;
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

        <div data-testid="name-row" className="grid grid-cols-2 gap-3">
          <TextField
            label={t("auth.fields.firstName")}
            autoComplete="given-name"
            placeholder={t("auth.fields.firstNamePlaceholder")}
            value={firstName}
            error={errors.firstName}
            onChange={(event) => setFirstName(event.target.value)}
          />
          <TextField
            label={t("auth.fields.lastName")}
            autoComplete="family-name"
            placeholder={t("auth.fields.lastNamePlaceholder")}
            value={lastName}
            error={errors.lastName}
            onChange={(event) => setLastName(event.target.value)}
          />
        </div>
        <TextField
          label={t("auth.fields.username")}
          autoComplete="username"
          placeholder={t("auth.fields.usernamePlaceholder")}
          value={username}
          error={errors.username ?? (availability === "taken" ? t("auth.errors.usernameTaken") : undefined)}
          onChange={(event) => {
            setUsername(event.target.value);
            setErrors((current) => ({ ...current, username: undefined }));
          }}
        />
        {usernameMessage && (
          <p
            role="status"
            className={`-mt-2 text-[11px] ${availability === "available" ? "text-success-text" : "text-muted"}`}
          >
            {usernameMessage}
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
