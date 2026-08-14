import React from 'react';

const EMAIL_INPUT_PLACEHOLDER = 'you@example.com';
const EMAIL_INPUT_LABEL = 'Email address';

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export const EmailInput: React.FC<EmailInputProps> = ({
  value,
  onChange,
  placeholder = EMAIL_INPUT_PLACEHOLDER,
  label = EMAIL_INPUT_LABEL,
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      <input
        type="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-input-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
        placeholder={placeholder}
      />
    </div>
  );
};
