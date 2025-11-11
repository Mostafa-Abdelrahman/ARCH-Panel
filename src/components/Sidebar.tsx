import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar';
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
  User,
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
  { name: 'Settings Content', href: '/settings', icon: FileText },
  { name: 'Messages', href: '/messages', icon: Mail },
  { name: 'Audit Logs', href: '/audit-logs', icon: ClipboardList },
];

const Sidebar = () => {
  const location = useLocation();
  const { logout, admin } = useAuth();

  return (
    <SidebarPrimitive variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <User className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Admin Panel</span>
                  <span className="truncate text-xs">{admin?.name || 'Administrator'}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.name}
                >
                  <Link to={item.href}>
                    <Icon />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator className="mb-2" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={logout}
              tooltip="Logout"
              className="w-full"
            >
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </SidebarPrimitive>
  );
};

export default Sidebar;
