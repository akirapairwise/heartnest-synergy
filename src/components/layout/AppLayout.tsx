
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import PartnerActivityToast from '../notifications/PartnerActivityToast';

const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { profile } = useAuth();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <div className="flex min-h-screen">
        <Sidebar />
        
        <main className={cn("flex-1 transition-all", isSidebarOpen ? "lg:ml-64" : "")}>
          <Navbar />
          
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            <PartnerActivityToast />
            
            <Outlet />
          </div>
          
          <Footer />
        </main>
      </div>
    </>
  );
};

export default AppLayout;
