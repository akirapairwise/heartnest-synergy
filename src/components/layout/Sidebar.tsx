
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Heart, 
  Target, 
  Calendar, 
  MessageSquare, 
  PieChart, 
  Settings, 
  HelpCircle,
  Sparkles,
  Menu,
  X
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  { label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard' },
  { label: 'Mood Tracker', icon: <Heart className="w-5 h-5" />, path: '/moods' },
  { label: 'Goals', icon: <Target className="w-5 h-5" />, path: '/goals' },
  { label: 'Calendar', icon: <Calendar className="w-5 h-5" />, path: '/calendar' },
  { label: 'Messages', icon: <MessageSquare className="w-5 h-5" />, path: '/messages' },
  { label: 'Insights', icon: <PieChart className="w-5 h-5" />, path: '/insights' },
];

const NavLinks = () => (
  <>
    <div className="space-y-1">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => 
            `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted ${
              isActive 
                ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                : 'hover:text-foreground'
            }`
          }
        >
          {item.icon}
          {item.label}
        </NavLink>
      ))}
    </div>
    
    <div className="px-3 py-2">
      <div className="p-4 rounded-lg bg-harmony-50 border border-harmony-100 relative">
        <div className="absolute -top-3 -right-1">
          <div className="bg-harmony-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center">
            <Sparkles className="w-3 h-3 mr-1" />
            <span>Pro</span>
          </div>
        </div>
        <h3 className="font-medium text-sm text-harmony-700">HeartNest Pro</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Unlock premium features and get personalized AI insights.
        </p>
        <NavLink 
          to="/upgrade"
          className="text-xs text-harmony-600 hover:text-harmony-700 font-medium mt-2 inline-flex items-center"
        >
          Upgrade now
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 ml-1"
          >
            <path
              fillRule="evenodd"
              d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
              clipRule="evenodd"
            />
          </svg>
        </NavLink>
      </div>
    </div>
    
    <div className="space-y-1 pt-4 border-t">
      <NavLink
        to="/settings"
        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
      >
        <Settings className="w-5 h-5" />
        Settings
      </NavLink>
      <NavLink
        to="/help"
        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
      >
        <HelpCircle className="w-5 h-5" />
        Help & Support
      </NavLink>
    </div>
  </>
);

const MobileSidebar = () => (
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="ghost" size="icon" className="md:hidden">
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>
    </SheetTrigger>
    <SheetContent side="left" className="w-[85%] sm:w-[350px] pt-10">
      <div className="space-y-6 px-3">
        <NavLinks />
      </div>
    </SheetContent>
  </Sheet>
);

const Sidebar = () => {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return null; // Mobile sidebar is rendered in the navbar
  }

  return (
    <div className="w-64 border-r bg-background/50 py-6 hidden md:block">
      <div className="space-y-6 px-3">
        <NavLinks />
      </div>
    </div>
  );
};

export { Sidebar, MobileSidebar };
