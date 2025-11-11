import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api, handleApiError } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const SettingsContent = () => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    companyName: '',
    description: '',
    policyText: '',
    termText: '',
    copyrightText: '',
  });

  useEffect(() => {
    loadSettingsContent();
  }, []);

  const loadSettingsContent = async () => {
    try {
      const response = await api.getSettingsContent();
      
      // Handle the API response format: { success: true, data: {...} }
      let settingsData: any = {};
      if (response && typeof response === 'object') {
        if ('success' in response && 'data' in response && response.success) {
          settingsData = (response as any).data || {};
        } else if (response && !('success' in response)) {
          settingsData = response;
        }
      }
      
      if (settingsData) {
        setFormData({
          companyName: settingsData.companyName || '',
          description: settingsData.description || '',
          policyText: settingsData.policyText || '',
          termText: settingsData.termText || '',
          copyrightText: settingsData.copyrightText || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings content:', error);
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

      const settingsData = {
        companyName: formData.companyName.trim(),
        description: formData.description.trim(),
        copyrightText: formData.copyrightText.trim(),
        isActive: true
      };

      await api.updateSettingsContent(settingsData);
      toast({ title: 'Success', description: 'Settings content updated successfully' });
      loadSettingsContent();
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
        <h1 className="text-3xl font-bold">Settings Content</h1>
        <p className="text-muted-foreground mt-1">Edit your website settings information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Settings Information</CardTitle>
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
            <Label htmlFor="policyText">Policy Text *</Label>
            <Textarea
              id="policyText"
              value={formData.policyText}
              onChange={(e) => setFormData({ ...formData, policyText: e.target.value })}
              rows={4}
              placeholder="Your company's policy information"
            />
          </div>
          <div>
            <Label htmlFor="termText">Terms Text *</Label>
            <Textarea
              id="termText"
              value={formData.termText}
              onChange={(e) => setFormData({ ...formData, termText: e.target.value })}
              rows={4}
              placeholder="Your company's terms and conditions"
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

export default SettingsContent;
