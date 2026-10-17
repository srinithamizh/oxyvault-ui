import { useState } from "react";
import { Outlet } from "react-router";
import { useAuth } from "@/hooks/useAuth/useAuth";
import Header from "@/layout/Header/Header";
import MobileNav from "@/layout/MobileNav/MobileNav";
import Sidebar from "@/layout/Sidebar/Sidebar";

export default function AppShell() {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // The route guard keeps signed-out users out; this only narrows the type.
  if (!user) return null;

  return (
    <div className="min-h-screen">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
      <main
        className={`flex min-h-screen flex-col transition-[margin] duration-200 max-[800px]:ml-0 ${
          collapsed ? "ml-[78px]" : "ml-[250px]"
        }`}
      >
        <Header user={user} />
        <div className="mx-auto flex w-full max-w-[1540px] flex-1 flex-col px-8 pb-4 pt-[30px] max-[800px]:px-[15px] max-[800px]:pb-[100px] max-[800px]:pt-[22px]">
          <Outlet />
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
