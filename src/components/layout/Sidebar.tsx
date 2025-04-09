
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, LineChart, Target, Calendar, MessageSquare, Menu, X, Settings } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const navItems = [
    { to: '/dashboard', icon: <Home className="h-5 w-5" />, label: 'Dashboard' },
    { to: '/moods', icon: <LineChart className="h-5 w-5" />, label: 'Moods' },
    { to: '/goals', icon: <Target className="h-5 w-5" />, label: 'Goals' },
    { to: '/check-ins', icon: <Calendar className="h-5 w-5" />, label: 'Check-ins' },
    { to: '/recommendations', icon: <MessageSquare className="h-5 w-5" />, label: 'Recommendations' },
    { to: '/profile/settings', icon: <Settings className="h-5 w-5" />, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-card border-r transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <h2 className="text-lg font-bold">Relationship App</h2>
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md hover:bg-accent md:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 rounded-md transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    }`
                  }
                  onClick={() => {
                    if (window.innerWidth < 768) toggleSidebar();
                  }}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={toggleSidebar}
        className="fixed bottom-4 right-4 z-30 md:hidden bg-primary text-primary-foreground p-3 rounded-full shadow-lg"
      >
        <Menu className="h-6 w-6" />
      </button>
    </>
  );
};

export default Sidebar;
