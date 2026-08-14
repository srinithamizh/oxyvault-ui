import React from 'react';
import '@/styles/home-layout.css';

interface HomeLayoutProps {
  children: React.ReactNode;
  rightSection?: React.ReactNode;
}

export const HomeLayout: React.FC<HomeLayoutProps> = ({ children, rightSection }) => {
  return (
    <div className="home-layout">
      {/* Left – Form Section */}
      <div className="home-layout__left">
        {children}
      </div>

      {/* Right – Illustration Section */}
      {rightSection && <div className="home-layout__right">{rightSection}</div>}
    </div>
  );
};
