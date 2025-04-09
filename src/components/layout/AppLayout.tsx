
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { Sidebar } from './Sidebar';
import { useMediaQuery } from '@/hooks/use-media-query';

const AppLayout = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 bg-muted/20">
        {isDesktop && <Sidebar />}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
