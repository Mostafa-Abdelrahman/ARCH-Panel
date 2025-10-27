import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  Image,
  Megaphone,
  Briefcase,
  FolderKanban,
  Phone,
  Share2,
  FileText,
  Mail,
  ClipboardList,
  LogOut,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Admins', href: '/admins', icon: Users },
  { name: 'Logos', href: '/logos', icon: Image },
  { name: 'Hero Content', href: '/hero', icon: Megaphone },
  { name: 'Services', href: '/services', icon: Briefcase },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Contact Info', href: '/contact-info', icon: Phone },
  { name: 'Social Links', href: '/social-links', icon: Share2 },
  { name: 'Footer Content', href: '/footer', icon: FileText },
  { name: 'Messages', href: '/messages', icon: Mail },
  { name: 'Audit Logs', href: '/audit-logs', icon: ClipboardList },
];

const Sidebar = () => {
  const location = useLocation();
  const { logout, admin } = useAuth();

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-foreground">Admin Panel</h1>
        <p className="text-sm text-sidebar-foreground/70 mt-1">{admin?.name}</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={logout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
