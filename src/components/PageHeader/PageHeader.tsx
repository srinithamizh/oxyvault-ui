import type { ReactNode } from "react";

export interface PageHeaderProps {
  title: string;
  subtitle: string;
  action?: ReactNode;
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-5 max-[800px]:items-start">
      <div className="max-[520px]:max-w-[75%]">
        <h1 className="text-[27px] tracking-[-0.7px] max-[800px]:text-[23px]">{title}</h1>
        <p className="mt-[5px] text-[13px] text-muted">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
