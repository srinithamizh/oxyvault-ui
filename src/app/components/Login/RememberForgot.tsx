import React from 'react';

const REMEMBER_ME_LABEL = 'Remember me';
const FORGOT_PASSWORD_LABEL = 'Forgot password?';

interface RememberForgotProps {
  rememberMe: boolean;
  onRememberChange: (value: boolean) => void;
  onForgotPassword: () => void;
  rememberLabel?: string;
  forgotLabel?: string;
}

export const RememberForgot: React.FC<RememberForgotProps> = ({
  rememberMe,
  onRememberChange,
  onForgotPassword,
  rememberLabel = REMEMBER_ME_LABEL,
  forgotLabel = FORGOT_PASSWORD_LABEL,
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => onRememberChange(e.target.checked)}
          className="w-4 h-4 rounded border-border text-sky-600 focus:ring-sky-500"
        />
        <span className="text-sm text-muted-foreground">{rememberLabel}</span>
      </label>
      <button
        type="button"
        onClick={onForgotPassword}
        className="text-sm text-sky-600 dark:text-sky-400 hover:underline font-medium"
      >
        {forgotLabel}
      </button>
    </div>
  );
};
