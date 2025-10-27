import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { api, handleApiError } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit, GripVertical } from 'lucide-react';

const ContactInfo = () => {
  const [contactInfoItems, setContactInfoItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    type: '',
    label: '',
    value: '',
    icon: '',
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    loadContactInfo();
  }, []);

  const loadContactInfo = async () => {
    try {
      const response = await api.getContactInfo();
      
      // Handle the API response format: { success: true, data: [...] }
      let contactData: any[] = [];
      if (response && typeof response === 'object') {
        if ('success' in response && 'data' in response && response.success) {
          contactData = (response as any).data || [];
        } else if (Array.isArray(response)) {
          contactData = response;
        }
      }
      
      // Ensure it's an array
      if (Array.isArray(contactData)) {
        setContactInfoItems(contactData);
      } else {
        console.error('Expected array but got:', contactData);
        setContactInfoItems([]);
      }
    } catch (error) {
      console.error('Failed to fetch contact info:', error);
      handleApiError(error);
      setContactInfoItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!formData.type.trim() || !formData.label.trim() || !formData.value.trim()) {
        toast({ 
          title: 'Error', 
          description: 'Type, label, and value are required',
          variant: 'destructive' 
        });
        return;
      }

      const contactData = {
        type: formData.type.trim(),
        label: formData.label.trim(),
        value: formData.value.trim(),
        icon: formData.icon.trim() || null,
        order: formData.order,
        isActive: formData.isActive
      };

      if (editingItem) {
        await api.updateContactInfoItem(editingItem.id, contactData);
        toast({ title: 'Success', description: 'Contact info updated successfully' });
      } else {
        await api.createContactInfo(contactData);
        toast({ title: 'Success', description: 'Contact info created successfully' });
      }
      setIsDialogOpen(false);
      resetForm();
      loadContactInfo();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact info item?')) return;
    
    try {
      await api.deleteContactInfoItem(id);
      toast({ title: 'Success', description: 'Contact info deleted successfully' });
      loadContactInfo();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleBulkSave = async () => {
    try {
      const items = contactInfoItems.map((item, index) => ({
        type: item.type,
        label: item.label,
        value: item.value,
        icon: item.icon || null,
        order: item.order !== undefined ? item.order : index,
        isActive: item.isActive !== undefined ? item.isActive : true
      }));

      await api.updateContactInfo(items);
      toast({ title: 'Success', description: 'All contact information updated successfully' });
      loadContactInfo();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleToggleStatus = async (item: any) => {
    try {
      await api.updateContactInfoItem(item.id, { isActive: !item.isActive });
      toast({ title: 'Success', description: 'Contact info status updated successfully' });
      loadContactInfo();
    } catch (error) {
      handleApiError(error);
    }
  };

  const openEditDialog = (item: any) => {
    setEditingItem(item);
    setFormData({
      type: item.type || '',
      label: item.label || '',
      value: item.value || '',
      icon: item.icon || '',
      order: item.order || 0,
      isActive: item.isActive !== undefined ? item.isActive : true,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      type: '',
      label: '',
      value: '',
      icon: '',
      order: 0,
      isActive: true,
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contact Information</h1>
          <p className="text-muted-foreground mt-1">Manage your contact details and information</p>
        </div>
        <div className="flex gap-2">
          {contactInfoItems.length > 0 && (
            <Button variant="outline" onClick={handleBulkSave}>
              Save All Changes
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Contact Info
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Contact Info' : 'Add New Contact Info'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="address">Address</SelectItem>
                      <SelectItem value="fax">Fax</SelectItem>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="order">Order</Label>
                  <Input
                    id="order"
                    type="number"
                    min="0"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    placeholder="Display order"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="label">Label *</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g., Business Email, Mobile Phone"
                />
              </div>
              
              <div>
                <Label htmlFor="value">Value *</Label>
                <Input
                  id="value"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="e.g., contact@company.com, +1234567890"
                />
              </div>
              
              <div>
                <Label htmlFor="icon">Icon</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="e.g., mail, phone, map-pin (Lucide icon names)"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <Button onClick={handleSave} className="w-full">
                {editingItem ? 'Update' : 'Create'} Contact Info
              </Button>
            </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.isArray(contactInfoItems) && contactInfoItems.length > 0 ? (
          contactInfoItems.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{item.label}</span>
                  <div className="flex items-center gap-2">
                    {item.order !== undefined && (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                        #{item.order}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded ${
                      item.isActive 
                        ? 'bg-success text-success-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Type:</span> <span className="capitalize">{item.type}</span>
                  </p>
                  <p className="text-sm break-words">
                    <span className="font-medium">Value:</span> {item.value}
                  </p>
                  {item.icon && (
                    <p className="text-sm">
                      <span className="font-medium">Icon:</span> {item.icon}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(item)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant={item.isActive ? "secondary" : "outline"} 
                    size="sm" 
                    onClick={() => handleToggleStatus(item)}
                  >
                    {item.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No contact information found. Click "Add Contact Info" to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactInfo;
