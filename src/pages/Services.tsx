import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { api, handleApiError } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit } from 'lucide-react';

const Services = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '',
    features: [] as string[],
    order: 0,
    isActive: true,
  });
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await api.getServices();
      console.log('API response for services:', response);
      
      // Handle the API response format: { success: true, data: [...] }
      let serviceData: any[] = [];
      if (response && typeof response === 'object') {
        if ('success' in response && 'data' in response && response.success) {
          serviceData = (response as any).data || [];
        } else if (Array.isArray(response)) {
          serviceData = response;
        }
      }
      
      // Ensure it's an array
      if (Array.isArray(serviceData)) {
        setServices(serviceData);
      } else {
        console.error('Expected array but got:', serviceData);
        setServices([]);
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
      handleApiError(error);
      setServices([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!formData.title.trim() || !formData.description.trim() || !formData.icon.trim()) {
        toast({ 
          title: 'Error', 
          description: 'Title, description, and icon are required',
          variant: 'destructive' 
        });
        return;
      }

      const serviceData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        icon: formData.icon.trim(),
        features: formData.features,
        order: formData.order,
        isActive: formData.isActive
      };

      if (editingService) {
        await api.updateService(editingService.id, serviceData);
        toast({ title: 'Success', description: 'Service updated successfully' });
      } else {
        await api.createService(serviceData);
        toast({ title: 'Success', description: 'Service created successfully' });
      }
      setIsDialogOpen(false);
      resetForm();
      loadServices();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    try {
      await api.deleteService(id);
      toast({ title: 'Success', description: 'Service deleted successfully' });
      loadServices();
    } catch (error: any) {
      // Handle specific error for services with projects
      if (error?.status === 400 && error?.message?.includes('associated project')) {
        toast({ 
          title: 'Cannot Delete Service', 
          description: error.message,
          variant: 'destructive'
        });
      } else {
        handleApiError(error);
      }
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      // Use the existing updateService API to toggle status
      const service = services.find(s => s.id === id);
      if (service) {
        await api.updateService(id, { isActive: !service.isActive });
        toast({ title: 'Success', description: 'Service status updated successfully' });
        loadServices();
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  const openEditDialog = (service: any) => {
    setEditingService(service);
    setFormData({
      title: service.title || '',
      description: service.description || '',
      icon: service.icon || '',
      features: service.features || [],
      order: service.order || 0,
      isActive: service.isActive,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingService(null);
    setFormData({
      title: '',
      description: '',
      icon: '',
      features: [],
      order: 0,
      isActive: true,
    });
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({ ...formData, features: [...formData.features, newFeature] });
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Services</h1>
          <p className="text-muted-foreground mt-1">Manage your service offerings</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingService ? 'Edit Service' : 'Create New Service'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Service title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Detailed description of the service"
                  required
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="icon">Icon (Lucide icon name) *</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="e.g., Briefcase"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="order">Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    placeholder="Display order (0 = first)"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <Label>Features</Label>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <Input value={feature} readOnly />
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => removeFeature(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add feature"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                    />
                    <Button onClick={addFeature}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
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
                {editingService ? 'Update' : 'Create'} Service
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.isArray(services) && services.length > 0 ? (
          services.map((service) => (
            <Card key={service.id}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{service.title}</span>
                  <div className="flex items-center gap-2">
                    {service.order !== undefined && (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                        #{service.order}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded ${
                      service.isActive 
                        ? 'bg-success text-success-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {service.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {service.description}
                </p>
                {service.features && service.features.length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-1">Features:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {service.features.slice(0, 3).map((feature: string, i: number) => (
                        <li key={i}>• {feature}</li>
                      ))}
                      {service.features.length > 3 && (
                        <li>+ {service.features.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(service)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant={service.isActive ? "secondary" : "outline"} 
                    size="sm" 
                    onClick={() => handleToggleStatus(service.id)}
                  >
                    {service.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(service.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
            </CardContent>
          </Card>
        ))
        ) : (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No services found
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
