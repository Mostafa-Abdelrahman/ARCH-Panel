import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api, handleApiError } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const FooterContent = () => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    companyName: '',
    description: '',
    copyrightText: '',
  });

  useEffect(() => {
    loadFooterContent();
  }, []);

  const loadFooterContent = async () => {
    try {
      const response = await api.getFooterContent();
      
      // Handle the API response format: { success: true, data: {...} }
      let footerData: any = {};
      if (response && typeof response === 'object') {
        if ('success' in response && 'data' in response && response.success) {
          footerData = (response as any).data || {};
        } else if (response && !('success' in response)) {
          footerData = response;
        }
      }
      
      if (footerData) {
        setFormData({
          companyName: footerData.companyName || '',
          description: footerData.description || '',
          copyrightText: footerData.copyrightText || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch footer content:', error);
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!formData.companyName.trim() || !formData.description.trim() || !formData.copyrightText.trim()) {
        toast({ 
          title: 'Error', 
          description: 'Company name, description, and copyright text are required',
          variant: 'destructive' 
        });
        return;
      }

      const footerData = {
        companyName: formData.companyName.trim(),
        description: formData.description.trim(),
        copyrightText: formData.copyrightText.trim(),
        isActive: true
      };

      await api.updateFooterContent(footerData);
      toast({ title: 'Success', description: 'Footer content updated successfully' });
      loadFooterContent();
    } catch (error) {
      handleApiError(error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Footer Content</h1>
        <p className="text-muted-foreground mt-1">Edit your website footer information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Footer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="Your Company Name"
            />
          </div>
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="A comprehensive description of your company, services, and mission"
            />
          </div>
          <div>
            <Label htmlFor="copyrightText">Copyright Text *</Label>
            <Input
              id="copyrightText"
              value={formData.copyrightText}
              onChange={(e) => setFormData({ ...formData, copyrightText: e.target.value })}
              placeholder="© 2025 Your Company. All rights reserved."
            />
          </div>
          <Button onClick={handleSave} className="w-full">
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-6 rounded-md space-y-3">
            <h3 className="text-lg font-bold">{formData.companyName || 'Company Name'}</h3>
            <p className="text-sm text-muted-foreground">
              {formData.description || 'Your company description will appear here.'}
            </p>
            <p className="text-xs text-muted-foreground">
              {formData.copyrightText || '© 2025 Your Company. All rights reserved.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FooterContent;
