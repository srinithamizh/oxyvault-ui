import { useState } from 'react';
import OxyVaultLogo from '@/assets/logo.svg';
import { ThemeToggle } from '@/app/components/Theme/ThemeToggle';
import { LogoSection } from '@/app/components/Login/LogoSection';
import { EmailInput } from '@/app/components/Login/EmailInput';
import { PasswordInput } from '@/app/components/Login/PasswordInput';
import { RememberForgot } from '@/app/components/Login/RememberForgot';
import { LoginButton } from '@/app/components/Login/LoginButton';
import { SignupLink } from '@/app/components/Login/SignupLink';
import { APP_NAME } from '@/app/utils/constants';

const WELCOME_TITLE = 'Welcome back';
const WELCOME_SUBTITLE = 'Sign in to your account to continue.';
const OXYVAULT_LOGO_ALT = `${APP_NAME} Logo`;
const LOGIN_BUTTON_LABEL = `Sign in to ${APP_NAME}`;

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [remember, setRemember] = useState(false);

    const onLogin = () => {
        console.log('Login attempt', { email, password, remember });
    };

    const onSignup = () => {
        console.log('Signup clicked');
    };

    const onForgotPassword = () => {
        console.log('Forgot password clicked');
    };

    const leftContent = (
        <div className="max-w-sm mx-auto w-full">
            <LogoSection
                logoSrc={OxyVaultLogo}
                logoAlt={OXYVAULT_LOGO_ALT}
                title={WELCOME_TITLE}
                subtitle={WELCOME_SUBTITLE}
            />

            <EmailInput value={email} onChange={setEmail} />

            <PasswordInput
                value={password}
                onChange={setPassword}
                showPassword={showPass}
                onToggleShowPassword={() => setShowPass(!showPass)}
            />

            <RememberForgot
                rememberMe={remember}
                onRememberChange={setRemember}
                onForgotPassword={onForgotPassword}
            />

            <LoginButton onClick={onLogin} label={LOGIN_BUTTON_LABEL} />

            <SignupLink onSignup={onSignup} />

            <div className="mt-8">
                <ThemeToggle />
            </div>
        </div>
    );

    return leftContent;
}