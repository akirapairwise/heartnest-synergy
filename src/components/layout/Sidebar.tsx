
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Home,
  Heart,
  Calendar,
  Target,
  Settings,
  BarChart2,
  MessageCircle,
  Sparkles,
  PartyPopper,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

type SidebarItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
};

const sidebarItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: 'Moods',
    href: '/moods',
    icon: <Heart className="h-5 w-5" />,
  },
  {
    title: 'Check-Ins',
    href: '/check-ins',
    icon: <MessageCircle className="h-5 w-5" />,
  },
  {
    title: 'Goals',
    href: '/goals',
    icon: <Target className="h-5 w-5" />,
  },
  {
    title: 'Recommendations',
    href: '/recommendations',
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    title: 'Event Suggestions',
    href: '/event-suggestions',
    icon: <PartyPopper className="h-5 w-5" />,
  },
  {
    title: 'Mood History',
    href: '/mood-history',
    icon: <BarChart2 className="h-5 w-5" />,
  },
  {
    title: 'Settings',
    href: '/profile/settings',
    icon: <Settings className="h-5 w-5" />,
  },
];

const SidebarContent = () => {
  const location = useLocation();
  const { profile, isLoading } = useAuth();

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2">
        <div className="mb-6 px-3 pt-4">
          {isLoading ? (
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback>
                  {profile?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium leading-none">{profile?.full_name || 'User'}</p>
                <p className="text-sm text-muted-foreground">{profile?.nickname || 'Welcome'}</p>
              </div>
            </div>
          )}
        </div>
        <div className="space-y-1">
          {sidebarItems.map((item) => (
            <Link key={item.href} to={item.href}>
              <Button
                variant={location.pathname === item.href ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  location.pathname === item.href
                    ? 'bg-muted font-medium'
                    : ''
                )}
              >
                {item.icon}
                <span className="ml-2">{item.title}</span>
              </Button>
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-auto p-4">
        <p className="text-xs text-muted-foreground text-center">
          &copy; {new Date().getFullYear()} HeartNest
        </p>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <nav className="hidden lg:flex w-[240px] flex-col h-screen bg-background border-r">
      <SidebarContent />
    </nav>
  );
};

export default Sidebar;
