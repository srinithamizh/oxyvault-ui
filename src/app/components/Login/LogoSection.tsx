import React from 'react';
import { LOGO_SIZES } from '@/app/utils/constants';

interface LogoSectionProps {
  logoSrc: string;
  logoAlt: string;
  title?: string;
  subtitle?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  logoClassName?: string;
}

export const LogoSection: React.FC<LogoSectionProps> = ({
  logoSrc,
  logoAlt,
  title,
  subtitle,
  titleClassName = 'text-2xl font-semibold text-foreground mb-1.5',
  subtitleClassName = 'text-muted-foreground text-sm mb-8',
  logoClassName = LOGO_SIZES.FORM_SECTION,
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-center mb-10">
        <img src={logoSrc} alt={logoAlt} className={logoClassName} />
      </div>
      {title && <h1 className={titleClassName}>{title}</h1>}
      {subtitle && <p className={subtitleClassName}>{subtitle}</p>}
    </div>
  );
};
