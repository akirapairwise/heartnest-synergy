
import React, { useState } from 'react';
import { Home, Heart, Target, MessageSquare, Sparkles, Menu, LogOut, User } from "lucide-react";
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/dashboard", icon: <Home className="h-4 w-4" />, label: "Dashboard" },
  { path: "/moods", icon: <Heart className="h-4 w-4" />, label: "Mood Tracker" },
  { path: "/goals", icon: <Target className="h-4 w-4" />, label: "Goals" },
  { path: "/check-ins", icon: <MessageSquare className="h-4 w-4" />, label: "Check-Ins" },
  { path: "/recommendations", icon: <Sparkles className="h-4 w-4" />, label: "Recommendations" },
];

export function Sidebar() {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const partnerName = profile?.full_name || 'No Partner';
  const initials = profile?.full_name 
    ? profile.full_name.split(' ').map(name => name[0]).join('').toUpperCase() 
    : 'U';

  return (
    <aside className="hidden md:flex md:flex-col w-64 border-r h-[calc(100vh-4rem)] bg-background overflow-y-auto">
      <div className="flex flex-col h-full p-4">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavItem 
              key={item.path}
              href={item.path} 
              icon={item.icon}
              isActive={location.pathname === item.path}
            >
              {item.label}
            </NavItem>
          ))}
        </nav>
        
        <div className="mt-auto pt-4 border-t">
          <div className="flex items-center px-2 py-3 mb-2">
            <Avatar className="h-9 w-9 mr-3">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(initials)}`} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="text-sm font-medium truncate">{profile?.full_name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">Partner: {partnerName}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground" 
            onClick={signOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </aside>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const initials = profile?.full_name 
    ? profile.full_name.split(' ').map(name => name[0]).join('').toUpperCase() 
    : 'U';

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b flex items-center">
            <Avatar className="h-9 w-9 mr-3">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(initials)}`} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">HeartNest</h2>
              <p className="text-xs text-muted-foreground">{profile?.full_name || 'User'}</p>
            </div>
          </div>
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <NavItem 
                  key={item.path}
                  href={item.path} 
                  icon={item.icon}
                  isActive={location.pathname === item.path}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </NavItem>
              ))}
            </ul>
          </nav>
          <div className="p-4 border-t">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-muted-foreground" 
              onClick={() => {
                signOut();
                setOpen(false);
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}

function NavItem({ href, icon, children, isActive, onClick }: NavItemProps) {
  return (
    <li>
      <NavLink
        to={href}
        onClick={onClick}
        className={({ isActive: navActive }) =>
          cn(
            "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-secondary hover:text-foreground focus:outline-none focus:bg-secondary focus:text-foreground",
            (isActive || navActive) ? "bg-secondary text-foreground" : "text-muted-foreground"
          )
        }
      >
        {icon}
        {children}
      </NavLink>
    </li>
  );
}
