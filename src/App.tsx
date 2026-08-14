import { Login } from '@/app/components/Login/Login';
import { IllustrationSection } from '@/app/components/Login/IllustrationSection';
import { LoginLayout } from '@/app/layout/LoginLayout';
import OxyVaultLogo from '@/assets/logo.svg';
import { APP_NAME } from '@/app/utils/constants';

function App() {
  const oxyVaultLogoAlt = `${APP_NAME} Logo`;

  return (
    <LoginLayout
      rightSection={
        <IllustrationSection
          logoSrc={OxyVaultLogo}
          logoAlt={oxyVaultLogoAlt}
        />
      }
    >
      <Login />
    </LoginLayout>
  );
}

export default App;
