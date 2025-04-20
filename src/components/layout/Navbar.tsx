
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import { Bell, MessageSquare, UserCircle, Heart, Home, Target, Sparkles } from "lucide-react";
import { useToast } from '@/components/ui/use-toast';
import { cn } from "@/lib/utils";
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  
  console.log('Profile in Navbar:', profile);
  console.log('Avatar URL:', avatarUrl);
  console.log('Initials:', initials);
  
  const navItems = [
    { path: "/dashboard", icon: <Home className="h-4 w-4" />, label: "Dashboard" },
    { path: "/moods", icon: <Heart className="h-4 w-4" />, label: "Moods" },
    { path: "/goals", icon: <Target className="h-4 w-4" />, label: "Goals" },
    { path: "/check-ins", icon: <MessageSquare className="h-4 w-4" />, label: "Check-Ins" },
    { path: "/recommendations", icon: <Sparkles className="h-4 w-4" />, label: "Recommendations" },
  ];
  
  const handleNavigation = (path: string) => {
    // Force a clean navigation to the path
    navigate(path, { replace: true });
  };
  
  return (
    <div className="border-b sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center gap-2 mr-4">
          <Heart 
            className="h-6 w-6 text-love-500 cursor-pointer" 
            onClick={() => handleNavigation('/dashboard')}
          />
          <span 
            className="text-xl font-heading font-bold gradient-heading hidden sm:inline-block cursor-pointer"
            onClick={() => handleNavigation('/dashboard')}
          >
            HeartNest
          </span>
        </div>
        
        <div className="flex-1 justify-center hidden md:flex">
          <nav className="flex space-x-4">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  "flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-md transition-colors",
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
        
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0.5 right-0.5 flex h-2 w-2 rounded-full bg-love-500"></span>
          </Button>
          
          <div className="flex items-center gap-2">
            <Avatar 
              className="h-8 w-8 cursor-pointer" 
              onClick={() => handleNavigation('/profile/settings')}
            >
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={profile?.full_name || 'User'} />
              ) : (
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(initials)}`} />
              )}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            
            <Button variant="ghost" size="sm" onClick={signOut} className="text-xs sm:text-sm">
              Sign Out
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile navigation */}
      <div className="md:hidden border-t">
        <nav className="flex justify-between">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-xs",
                location.pathname === item.path
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
