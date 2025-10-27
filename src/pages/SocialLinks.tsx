import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { api, handleApiError } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit, ExternalLink, GripVertical } from 'lucide-react';

const SocialLinks = () => {
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    href: '',
    icon: '',
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    loadSocialLinks();
  }, []);

  const loadSocialLinks = async () => {
    try {
      const response = await api.getSocialLinks();
      
      // Handle the API response format: { success: true, data: [...] }
      let socialData: any[] = [];
      if (response && typeof response === 'object') {
        if ('success' in response && 'data' in response && response.success) {
          socialData = (response as any).data || [];
        } else if (Array.isArray(response)) {
          socialData = response;
        }
      }
      
      // Ensure it's an array
      if (Array.isArray(socialData)) {
        setSocialLinks(socialData);
      } else {
        console.error('Expected array but got:', socialData);
        setSocialLinks([]);
      }
    } catch (error) {
      console.error('Failed to fetch social links:', error);
      handleApiError(error);
      setSocialLinks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!formData.name.trim() || !formData.href.trim() || !formData.icon.trim()) {
        toast({ 
          title: 'Error', 
          description: 'Name, URL, and icon are required',
          variant: 'destructive' 
        });
        return;
      }

      // Validate URL format
      try {
        new URL(formData.href);
      } catch {
        toast({ 
          title: 'Error', 
          description: 'Please enter a valid URL',
          variant: 'destructive' 
        });
        return;
      }

      const socialData = {
        name: formData.name.trim(),
        href: formData.href.trim(),
        icon: formData.icon.trim(),
        order: formData.order,
        isActive: formData.isActive
      };

      if (editingLink) {
        await api.updateSocialLink(editingLink.id, socialData);
        toast({ title: 'Success', description: 'Social link updated successfully' });
      } else {
        await api.createSocialLink(socialData);
        toast({ title: 'Success', description: 'Social link created successfully' });
      }
      setIsDialogOpen(false);
      resetForm();
      loadSocialLinks();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this social link?')) return;
    
    try {
      await api.deleteSocialLink(id);
      toast({ title: 'Success', description: 'Social link deleted successfully' });
      loadSocialLinks();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleBulkSave = async () => {
    try {
      const items = socialLinks.map((link, index) => ({
        name: link.name,
        href: link.href,
        icon: link.icon,
        order: link.order !== undefined ? link.order : index,
        isActive: link.isActive !== undefined ? link.isActive : true
      }));

      await api.updateSocialLinks(items);
      toast({ title: 'Success', description: 'All social links updated successfully' });
      loadSocialLinks();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleToggleStatus = async (link: any) => {
    try {
      await api.updateSocialLink(link.id, { isActive: !link.isActive });
      toast({ title: 'Success', description: 'Social link status updated successfully' });
      loadSocialLinks();
    } catch (error) {
      handleApiError(error);
    }
  };

  const openEditDialog = (link: any) => {
    setEditingLink(link);
    setFormData({
      name: link.name || '',
      href: link.href || '',
      icon: link.icon || '',
      order: link.order || 0,
      isActive: link.isActive !== undefined ? link.isActive : true,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingLink(null);
    setFormData({
      name: '',
      href: '',
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
          <h1 className="text-3xl font-bold">Social Links</h1>
          <p className="text-muted-foreground mt-1">Manage your social media profiles and links</p>
        </div>
        <div className="flex gap-2">
          {socialLinks.length > 0 && (
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
                Add Social Link
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingLink ? 'Edit Social Link' : 'Add New Social Link'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Facebook, Twitter, LinkedIn"
                    />
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
                  <Label htmlFor="href">URL *</Label>
                  <Input
                    id="href"
                    value={formData.href}
                    onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                    placeholder="https://www.facebook.com/yourpage"
                    type="url"
                  />
                </div>
                
                <div>
                  <Label htmlFor="icon">Icon *</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="e.g., facebook, twitter, linkedin (Lucide icon names)"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use Lucide React icon names (e.g., facebook, twitter, instagram, linkedin)
                  </p>
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
                  {editingLink ? 'Update' : 'Create'} Social Link
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.isArray(socialLinks) && socialLinks.length > 0 ? (
          socialLinks.map((link) => (
            <Card key={link.id}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{link.name}</span>
                  <div className="flex items-center gap-2">
                    {link.order !== undefined && (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                        #{link.order}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded ${
                      link.isActive 
                        ? 'bg-success text-success-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {link.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1 break-words"
                  >
                    Visit link
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                  <p className="text-xs text-muted-foreground truncate" title={link.href}>
                    {link.href}
                  </p>
                  {link.icon && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Icon:</span> {link.icon}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(link)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant={link.isActive ? "secondary" : "outline"} 
                    size="sm" 
                    onClick={() => handleToggleStatus(link)}
                  >
                    {link.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(link.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No social links found. Click "Add Social Link" to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialLinks;
