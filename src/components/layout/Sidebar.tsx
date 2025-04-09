import React from 'react';
import { Home, Heart, Target, MessageSquare, Sparkles } from "lucide-react";
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Sidebar() {
  const { profile, signOut } = useAuth();
  const partnerName = profile?.partner_name || 'No Partner';

  return (
    <aside className="hidden md:flex md:flex-col w-64 border-r h-[calc(100vh-4rem)] bg-background">
      <div className="flex flex-col h-full p-4">
        <div className="space-y-1">
          <NavItem href="/dashboard" icon={<Home className="h-4 w-4" />}>Dashboard</NavItem>
          <NavItem href="/moods" icon={<Heart className="h-4 w-4" />}>Mood Tracker</NavItem>
          <NavItem href="/goals" icon={<Target className="h-4 w-4" />}>Goals</NavItem>
          <NavItem href="/check-ins" icon={<MessageSquare className="h-4 w-4" />}>Check-Ins</NavItem>
          <NavItem href="/recommendations" icon={<Sparkles className="h-4 w-4" />}>Recommendations</NavItem>
        </div>
        
        <div className="mt-auto py-2 space-y-1 border-t">
          <div className="px-2 text-sm text-muted-foreground">
            Partner: {partnerName}
          </div>
          <NavItem href="#" onClick={signOut} icon={<Home className="h-4 w-4" />}>
            Sign Out
          </NavItem>
        </div>
      </div>
    </aside>
  );
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}

function NavItem({ href, icon, children, onClick }: NavItemProps) {
  return (
    <li>
      <NavLink
        to={href}
        onClick={onClick}
        className={({ isActive }) =>
          `flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-secondary hover:text-foreground focus:outline-none focus:bg-secondary focus:text-foreground ${
            isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground'
          }`
        }
      >
        {icon}
        {children}
      </NavLink>
    </li>
  );
}
