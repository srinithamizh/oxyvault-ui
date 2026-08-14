import React from 'react';
import '@/styles/home-layout.css';

interface LoginLayoutProps {
  children: React.ReactNode;
  rightSection?: React.ReactNode;
}

export const LoginLayout: React.FC<LoginLayoutProps> = ({ children, rightSection }) => {
  return (
    <div className="home-layout">
      <div className="home-layout__left">{children}</div>
      {rightSection && <div className="home-layout__right">{rightSection}</div>}
    </div>
  );
};
