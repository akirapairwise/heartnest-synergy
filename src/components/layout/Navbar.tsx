
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import { MessageSquare, UserCircle, Heart, Home, Target, Sparkles } from "lucide-react";
import { useToast } from '@/components/ui/use-toast';
import { cn } from "@/lib/utils";
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NotificationsDropdown from '@/components/notifications/NotificationsDropdown';
import { motion } from 'framer-motion';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { profile, signOut } = useAuth();
  
  // Get initials from full name or use 'U' as fallback
  const initials = profile?.full_name 
    ? profile.full_name.split(' ').map(name => name[0]).join('').toUpperCase() 
    : 'U';
  
  // Get avatar URL or use null
  const avatarUrl = profile?.avatar_url || null;
  
  const navItems = [
    { path: "/dashboard", icon: <Home className="h-4 w-4" />, label: "Dashboard" },
    { path: "/moods", icon: <Heart className="h-4 w-4" />, label: "Moods" },
    { path: "/goals", icon: <Target className="h-4 w-4" />, label: "Goals" },
    { path: "/check-ins", icon: <MessageSquare className="h-4 w-4" />, label: "Check-Ins" },
    { path: "/recommendations", icon: <Sparkles className="h-4 w-4" />, label: "Suggestions" },
  ];
  
  const handleNavigation = (path: string) => {
    // Force a clean navigation to the path
    navigate(path, { replace: true });
  };
  
  return (
    <div className="border-b sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm safe-top">
      <div className="flex h-14 sm:h-16 items-center px-3 sm:px-4">
        <div className="flex items-center gap-1 sm:gap-2 mr-2 sm:mr-4">
          <Heart 
            className="h-5 w-5 sm:h-6 sm:w-6 text-love-500 cursor-pointer touch-manipulation" 
            onClick={() => handleNavigation('/dashboard')}
          />
          <span 
            className="text-lg sm:text-xl font-heading font-bold gradient-heading hidden sm:inline-block cursor-pointer"
            onClick={() => handleNavigation('/dashboard')}
          >
            Usora
          </span>
        </div>
        
        <div className="flex-1 justify-center hidden md:flex">
          <nav className="flex space-x-2 sm:space-x-4">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  "flex items-center gap-1.5 text-xs sm:text-sm font-medium px-2 sm:px-3 py-2 rounded-md transition-colors touch-manipulation",
                  location.pathname === item.path
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {/* Notifications dropdown with improved mobile support */}
          <NotificationsDropdown className="h-10 w-10 sm:h-9 sm:w-9" />
          
          <div className="flex items-center gap-1 sm:gap-2">
            <Avatar 
              className="h-8 w-8 sm:h-8 sm:w-8 cursor-pointer touch-manipulation" 
              onClick={() => handleNavigation('/profile/settings')}
            >
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={profile?.full_name || 'User'} />
              ) : (
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(initials)}`} />
              )}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={signOut} 
              className="text-xs hidden sm:inline-flex"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile navigation - with motion animation for smooth transitions */}
      <motion.div 
        className="md:hidden border-t"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <nav className="flex justify-between">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-[10px] sm:text-xs touch-manipulation",
                location.pathname === item.path
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "p-1 rounded-full",
                  location.pathname === item.path ? "bg-secondary/30" : ""
                )}
              >
                {item.icon}
              </motion.div>
              <span className="truncate max-w-[60px] text-center">{item.label}</span>
            </button>
          ))}
        </nav>
      </motion.div>
    </div>
  );
};

export default Navbar;
