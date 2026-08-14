import React from 'react';
import { APP_NAME } from '@/app/utils/constants';

const LOGIN_BUTTON_LABEL = `Sign in to ${APP_NAME}`;
const LOADING_TEXT = 'Loading...';

interface LoginButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
  loading?: boolean;
  className?: string;
}

export const LoginButton: React.FC<LoginButtonProps> = ({
  onClick,
  disabled = false,
  label = LOGIN_BUTTON_LABEL,
  loading = false,
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full rounded-xl bg-button-primary hover:bg-button-primary-hover text-button-primary-foreground py-2.5 text-sm font-medium transition-colors shadow-lg mb-4 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        backgroundColor: `var(--button-primary)`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = `var(--button-primary-hover)`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = `var(--button-primary)`;
      }}
    >
      {loading ? LOADING_TEXT : label}
    </button>
  );
};
