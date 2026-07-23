import OxyVaultLogo from '@/assets/logo.svg';

function App() {

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <img src={OxyVaultLogo} alt="OxyVault Logo" className="w-64 h-64 mb-4" />
        <h1 className="text-4xl font-bold text-gray-800">Welcome to <span className="oxyvault-red">Oxy</span><span className="oxyvault-green">Vault</span></h1>
        <p className="mt-4 text-lg text-gray-600">
          Launching Soon!
        </p>
      </div>
    </>
  )
}

export default App
