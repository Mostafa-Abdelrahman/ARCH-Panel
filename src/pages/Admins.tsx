import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { api, handleApiError } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2, Key } from 'lucide-react';

const Admins = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      const response = await api.getAdmins();
      
      // Handle different response formats
      let adminData: any[] = [];
      if (Array.isArray(response)) {
        adminData = response;
      } else if (response && typeof response === 'object' && 'data' in response) {
        adminData = (response as any).data || [];
      }
      
      // Ensure it's an array
      if (Array.isArray(adminData)) {
        setAdmins(adminData);
      } else {
        console.error('Expected array but got:', adminData);
        setAdmins([]);
      }
    } catch (error) {
      console.error('Failed to fetch admins:', error);
      handleApiError(error);
      setAdmins([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await api.createAdmin(formData);
      toast({ title: 'Success', description: 'Admin created successfully' });
      setIsCreateOpen(false);
      setFormData({ name: '', email: '', password: '' });
      loadAdmins();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this admin?')) return;
    
    try {
      await api.deleteAdmin(id);
      toast({ title: 'Success', description: 'Admin deleted successfully' });
      loadAdmins();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast({ 
        title: 'Error', 
        description: 'Please fill in both current and new password',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      await api.changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast({ title: 'Success', description: 'Password changed successfully' });
      setIsPasswordOpen(false);
      setPasswordData({ currentPassword: '', newPassword: '' });
      setSelectedAdmin(null);
    } catch (error) {
      handleApiError(error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admins</h1>
          <p className="text-muted-foreground mt-1">Manage administrator accounts</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Admin</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <Button onClick={handleCreate} className="w-full">Create Admin</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.isArray(admins) && admins.length > 0 ? (
          admins.map((admin) => (
            <Card key={admin.id}>
              <CardHeader>
                <CardTitle className="text-lg">{admin.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{admin.email}</p>
                <p className="text-xs text-muted-foreground">
                  Created: {new Date(admin.createdAt).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedAdmin(admin);
                      setIsPasswordOpen(true);
                    }}
                  >
                    <Key className="h-4 w-4 mr-1" />
                    Change Password
                  </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(admin.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
        ) : (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No admins found
          </div>
        )}
      </div>

      <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="Enter your current password"
              />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="Enter new password (min 6 characters)"
              />
            </div>
            <Button onClick={handleChangePassword} className="w-full">
              Update Password
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admins;
