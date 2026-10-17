import { useTranslation } from "react-i18next";
import { Outlet } from "react-router";
import Logo from "@/components/Logo/Logo";
import SiteFooter from "@/components/SiteFooter/SiteFooter";

export default function AuthLayout() {
  const { t } = useTranslation();

  return (
    <div className="relative grid min-h-screen grid-cols-[1.15fr_0.85fr] items-center bg-surface max-[1150px]:grid-cols-2 max-[800px]:block max-[800px]:pb-[30px] max-[800px]:pt-20">
      <Logo className="absolute left-[35px] top-7 z-10 text-white max-[800px]:left-[25px] max-[800px]:top-[22px] max-[800px]:text-fg" />

      <section
        aria-label={t("auth.layout.welcome")}
        className="relative flex items-center self-stretch overflow-hidden bg-[image:var(--auth-panel-bg)] p-[10%] text-white max-[800px]:hidden"
      >
        <span
          aria-hidden="true"
          className="absolute -right-[210px] -top-[120px] size-[520px] rounded-full border border-white/10 shadow-[0_0_0_70px_#ffffff08,0_0_0_150px_#ffffff05]"
        />
        <div className="relative z-[1] max-w-[570px]">
          <h2 className="mb-[18px] text-[54px] leading-[1.06] tracking-[-2px] max-[1150px]:text-[40px]">
            {t("auth.layout.headlineLine1")}
            <br />
            {t("auth.layout.headlineLine2")}
          </h2>
          <p className="max-w-[480px] text-[15px] leading-[1.7] text-white/75">{t("auth.layout.tagline")}</p>
        </div>
      </section>

      <div className="flex min-h-screen flex-col max-[800px]:min-h-0">
        <main className="mx-auto flex w-[min(440px,calc(100%-50px))] flex-1 flex-col justify-center px-[30px] py-5 max-[800px]:w-[min(500px,calc(100%-24px))] max-[800px]:px-5">
          <Outlet />
        </main>
        <SiteFooter className="px-5 py-4" />
      </div>
    </div>
  );
}
