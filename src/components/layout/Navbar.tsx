
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Bell, MessageSquare, UserCircle, Heart } from "lucide-react";
import { useToast } from '@/components/ui/use-toast';
import { MobileSidebar } from './Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

const Navbar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate('/');
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="flex h-16 items-center px-4 sm:px-6 md:container">
        <div className="flex items-center gap-2">
          {isMobile && <MobileSidebar />}
          <Heart className="h-6 w-6 text-love-500" />
          <span className="text-xl font-heading font-bold gradient-heading">HeartNest</span>
        </div>
        
        <div className="ml-auto flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" className="relative hidden sm:flex">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0.5 right-0.5 flex h-2 w-2 rounded-full bg-love-500"></span>
          </Button>
          
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <MessageSquare className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={() => navigate('/profile')} className="hidden sm:flex">
              <UserCircle className="h-5 w-5 mr-2" />
              <span>Alex</span>
            </Button>
            
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-xs sm:text-sm">
              {isMobile ? <UserCircle className="h-5 w-5" /> : "Logout"}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
