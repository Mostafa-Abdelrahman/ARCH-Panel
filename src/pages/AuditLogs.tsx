import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api, handleApiError } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const AuditLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: 'all',
    startDate: '',
    endDate: '',
  });
  const [selectedLog, setSelectedLog] = useState<any>(null);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      // Convert 'all' to empty string for API call
      const apiFilters = {
        ...filters,
        action: filters.action === 'all' ? '' : filters.action
      };
      
      const response = await api.getAuditLogs(apiFilters);
      
      // Handle the API response format: { success: true, data: [...] }
      let logData: any[] = [];
      if (response && typeof response === 'object') {
        if ('success' in response && 'data' in response && response.success) {
          logData = (response as any).data || [];
        } else if (Array.isArray(response)) {
          logData = response;
        }
      }
      
      // Ensure it's an array
      if (Array.isArray(logData)) {
        setLogs(logData);
      } else {
        console.error('Expected array but got:', logData);
        setLogs([]);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      handleApiError(error);
      setLogs([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const applyFilters = () => {
    setLoading(true);
    loadLogs();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground mt-1">View system activity and changes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label htmlFor="action">Action</Label>
              <Select value={filters.action} onValueChange={(value) => handleFilterChange('action', value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  <SelectItem value="CREATE">Create</SelectItem>
                  <SelectItem value="UPDATE">Update</SelectItem>
                  <SelectItem value="DELETE">Delete</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 w-full"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {!Array.isArray(logs) || logs.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No logs found
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedLog(log)}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            log.action === 'CREATE'
                              ? 'default'
                              : log.action === 'UPDATE'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {log.action}
                        </Badge>
                        <span className="font-medium">{log.entityType}</span>
                        {log.entityId && (
                          <span className="text-xs text-muted-foreground">
                            ID: {log.entityId.slice(0, 8)}...
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        by {log.admin?.name || log.adminId}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Action</Label>
                  <p className="text-sm font-medium mt-1">{selectedLog.action}</p>
                </div>
                <div>
                  <Label>Entity Type</Label>
                  <p className="text-sm font-medium mt-1">{selectedLog.entityType}</p>
                </div>
                <div>
                  <Label>Entity ID</Label>
                  <p className="text-sm font-mono mt-1">{selectedLog.entityId}</p>
                </div>
                <div>
                  <Label>Admin</Label>
                  <p className="text-sm font-medium mt-1">
                    {selectedLog.admin?.name || selectedLog.adminId}
                  </p>
                </div>
                <div className="col-span-2">
                  <Label>Timestamp</Label>
                  <p className="text-sm font-medium mt-1">
                    {new Date(selectedLog.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedLog.changes && (
                <div>
                  <Label>Changes (JSON)</Label>
                  <pre className="mt-2 p-4 bg-muted rounded-md text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.changes, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuditLogs;
