import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api, handleApiError } from '@/lib/api';
import { FolderKanban, Briefcase, Mail, ClipboardList } from 'lucide-react';

interface DashboardStats {
  projects: number;
  services: number;
  unreadMessages: number;
  recentLogs: any[];
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    projects: 0,
    services: 0,
    unreadMessages: 0,
    recentLogs: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [projectsResponse, servicesResponse, messagesResponse, logsResponse] = await Promise.all([
        api.getProjects(),
        api.getServices(),
        api.getContactMessages(),
        api.getAuditLogs(),
      ]);

      // Handle different response formats for each API call
      const projects = extractArrayData(projectsResponse);
      const services = extractArrayData(servicesResponse);
      const messages = extractArrayData(messagesResponse);
      const logs = extractArrayData(logsResponse);

      setStats({
        projects: projects.length,
        services: services.length,
        unreadMessages: messages.filter((m: any) => !m.isRead).length,
        recentLogs: logs.slice(0, 10),
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      handleApiError(error);
      // Set default values on error
      setStats({
        projects: 0,
        services: 0,
        unreadMessages: 0,
        recentLogs: [],
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to extract array data from API responses
  const extractArrayData = (response: any): any[] => {
    if (Array.isArray(response)) {
      return response;
    }
    if (response && typeof response === 'object') {
      if ('success' in response && 'data' in response && response.success) {
        const data = response.data;
        return Array.isArray(data) ? data : [];
      }
    }
    return [];
  };

  const statCards = [
    {
      title: 'Total Projects',
      value: stats.projects,
      icon: FolderKanban,
      color: 'text-primary',
    },
    {
      title: 'Active Services',
      value: stats.services,
      icon: Briefcase,
      color: 'text-accent',
    },
    {
      title: 'Unread Messages',
      value: stats.unreadMessages,
      icon: Mail,
      color: 'text-destructive',
    },
    {
      title: 'Recent Activity',
      value: stats.recentLogs.length,
      icon: ClipboardList,
      color: 'text-muted-foreground',
    },
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to your admin panel</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {!Array.isArray(stats.recentLogs) || stats.recentLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            ) : (
              stats.recentLogs.map((log: any) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between border-b pb-3 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{log.action}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {log.entityType} {log.entityId && `• ${log.entityId}`}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
