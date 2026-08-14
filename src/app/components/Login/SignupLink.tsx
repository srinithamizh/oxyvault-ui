import React from 'react';

const SIGNUP_BEFORE_TEXT = "Don't have an account? ";
const SIGNUP_LINK_TEXT = 'Sign up';

interface SignupLinkProps {
  onSignup: () => void;
  beforeText?: string;
  linkText?: string;
}

export const SignupLink: React.FC<SignupLinkProps> = ({
  onSignup,
  beforeText = SIGNUP_BEFORE_TEXT,
  linkText = SIGNUP_LINK_TEXT,
}) => {
  return (
    <p className="text-center text-sm text-muted-foreground">
      {beforeText}
      <button
        type="button"
        onClick={onSignup}
        className="text-sky-600 dark:text-sky-400 font-medium hover:underline"
      >
        {linkText}
      </button>
    </p>
  );
};
