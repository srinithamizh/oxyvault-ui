import OxyVaultLogo from '@/assets/logo.svg';
import { ThemeToggle } from '@/app/components/Theme/ThemeToggle';

function App() {

  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
        <img src={OxyVaultLogo} alt="OxyVault Logo" className="logo-glow mb-4 h-64 w-64" />
        <h1 className="text-4xl font-bold text-foreground">
          Welcome to <span className="oxyvault-red">Oxy</span><span className="oxyvault-green">Vault</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Launching Soon!
        </p>
        <ThemeToggle />
      </div>
    </>
  )
}

export default App
