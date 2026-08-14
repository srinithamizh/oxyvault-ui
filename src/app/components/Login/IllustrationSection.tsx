import React from 'react';
import { LOGO_SIZES } from '@/app/utils/constants';

const ILLUSTRATION_TITLE = 'Securely manage your finances.';
const ILLUSTRATION_DESCRIPTION = 'Full visibility of your net worth, accounts, budgets, and investments — in one secure place.';

interface IllustrationSectionProps {
  logoSrc: string;
  logoAlt: string;
  title?: string;
  description?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  logoClassName?: string;
}

export const IllustrationSection: React.FC<IllustrationSectionProps> = ({
  logoSrc,
  logoAlt,
  title = ILLUSTRATION_TITLE,
  description = ILLUSTRATION_DESCRIPTION,
  titleClassName = 'text-white text-2xl font-semibold mb-2',
  descriptionClassName = 'text-sky-100/80 text-sm max-w-xs mx-auto',
  logoClassName = LOGO_SIZES.ILLUSTRATION_SECTION,
}) => {
  return (
    <div className="relative z-10 text-center">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 mb-5 border border-white/20">
        <img src={logoSrc} alt={logoAlt} className={`${logoClassName} mx-auto mb-4`} />
      </div>
      <h2 className={titleClassName}>{title}</h2>
      <p className={descriptionClassName}>{description}</p>
    </div>
  );
};
