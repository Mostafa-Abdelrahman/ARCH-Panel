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
import { Plus, Trash2, Edit } from 'lucide-react';

const Logos = () => {
  const [logos, setLogos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLogo, setEditingLogo] = useState<any>(null);
  const [formData, setFormData] = useState({ url: '', type: 'ICON', altText: '', isActive: true });

  useEffect(() => {
    loadLogos();
  }, []);

  const loadLogos = async () => {
    try {
      const response = await api.getLogos();
      
      // Handle the API response format: { success: true, data: [...] }
      let logoData: any[] = [];
      if (response && typeof response === 'object') {
        if ('success' in response && 'data' in response && response.success) {
          logoData = (response as any).data || [];
        } else if (Array.isArray(response)) {
          logoData = response;
        } else if ('id' in response) {
          // Single logo object
          logoData = [response];
        }
      }
      
      // Ensure it's an array
      if (Array.isArray(logoData)) {
        setLogos(logoData);
      } else {
        console.error('Expected array but got:', logoData);
        setLogos([]);
      }
    } catch (error) {
      console.error('Failed to fetch logos:', error);
      handleApiError(error);
      setLogos([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!formData.url || !formData.altText) {
        toast({ 
          title: 'Error', 
          description: 'Logo URL and Alt Text are required',
          variant: 'destructive' 
        });
        return;
      }

      // Transform form data to match API expectations
      const apiData = {
        logoUrl: formData.url,
        type: formData.type,
        altText: formData.altText,
        isActive: formData.isActive
      };
      
      if (editingLogo) {
        await api.updateLogo(editingLogo.id, apiData);
        toast({ title: 'Success', description: 'Logo updated successfully' });
      } else {
        await api.createLogo(apiData);
        toast({ title: 'Success', description: 'Logo created successfully' });
      }
      setIsDialogOpen(false);
      resetForm();
      loadLogos();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this logo?')) return;
    
    try {
      await api.deleteLogo(id);
      toast({ title: 'Success', description: 'Logo deleted successfully' });
      loadLogos();
    } catch (error) {
      handleApiError(error);
    }
  };

  const openEditDialog = (logo: any) => {
    setEditingLogo(logo);
    setFormData({ 
      url: logo.logoUrl || logo.url, 
      type: logo.type, 
      altText: logo.altText || '',
      isActive: logo.isActive 
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingLogo(null);
    setFormData({ url: '', type: 'MAIN', altText: '', isActive: true });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Logos</h1>
          <p className="text-muted-foreground mt-1">Manage your brand logos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Logo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingLogo ? 'Edit Logo' : 'Create New Logo'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="url">Logo URL</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div>
                <Label htmlFor="altText">Alt Text</Label>
                <Input
                  id="altText"
                  value={formData.altText}
                  onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
                  placeholder="Descriptive text for accessibility"
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ICON">Icon</SelectItem>
                    <SelectItem value="LOGO">Logo</SelectItem>
                  </SelectContent>
                </Select>
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
                {editingLogo ? 'Update' : 'Create'} Logo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.isArray(logos) && logos.length > 0 ? (
          logos.map((logo) => (
            <Card key={logo.id}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{logo.type}</span>
                  {logo.isActive && (
                    <span className="text-xs bg-success text-success-foreground px-2 py-1 rounded">
                      Active
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-32 flex items-center justify-center bg-muted rounded">
                  <img 
                    src={logo.logoUrl || logo.url} 
                    alt={logo.altText || logo.type} 
                    className="max-h-full max-w-full object-contain" 
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground truncate">{logo.logoUrl || logo.url}</p>
                  {logo.altText && (
                    <p className="text-xs text-muted-foreground italic">Alt: {logo.altText}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(logo)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(logo.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No logos found
          </div>
        )}
      </div>
    </div>
  );
};

export default Logos;
