import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api, handleApiError } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';

const HeroContent = () => {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    buttonText: '',
    buttonLink: '',
    secondaryButtonText: '',
    secondaryButtonLink: '',
    images: [] as string[],
  });
  const [newImage, setNewImage] = useState('');

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const response = await api.getHeroContent();
      
      // Handle the API response format: { success: true, data: {...} }
      let contentData = null;
      if (response && typeof response === 'object') {
        if ('success' in response && 'data' in response && response.success) {
          contentData = (response as any).data;
        } else {
          contentData = response;
        }
      }
      
      if (contentData) {
        setContent(contentData);
        setFormData({
          title: contentData.title || '',
          subtitle: contentData.subtitle || '',
          description: contentData.description || '',
          buttonText: contentData.buttonText || '',
          buttonLink: contentData.buttonLink || '',
          secondaryButtonText: contentData.secondaryButtonText || '',
          secondaryButtonLink: contentData.secondaryButtonLink || '',
          images: contentData.images || [],
        });
      }
    } catch (error) {
      console.error('Failed to fetch hero content:', error);
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!formData.title || !formData.subtitle || !formData.description || 
          !formData.buttonText || !formData.buttonLink) {
        toast({ 
          title: 'Error', 
          description: 'Please fill in all required fields',
          variant: 'destructive' 
        });
        return;
      }

      await api.updateHeroContent(formData);
      toast({ title: 'Success', description: 'Hero content updated successfully' });
      loadContent();
    } catch (error) {
      handleApiError(error);
    }
  };

  const addImage = () => {
    if (newImage.trim()) {
      setFormData({ ...formData, images: [...formData.images, newImage] });
      setNewImage('');
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Hero Content</h1>
        <p className="text-muted-foreground mt-1">Edit your homepage hero section</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hero Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Main hero title"
                required
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Subtitle *</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Supporting subtitle"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="Detailed description of your hero section"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="buttonText">Primary Button Text *</Label>
              <Input
                id="buttonText"
                value={formData.buttonText}
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                placeholder="Call to action button text"
                required
              />
            </div>
            <div>
              <Label htmlFor="buttonLink">Primary Button Link *</Label>
              <Input
                id="buttonLink"
                value={formData.buttonLink}
                onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                placeholder="https://example.com"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="secondaryButtonText">Secondary Button Text (Optional)</Label>
              <Input
                id="secondaryButtonText"
                value={formData.secondaryButtonText}
                onChange={(e) => setFormData({ ...formData, secondaryButtonText: e.target.value })}
                placeholder="Optional secondary action text"
              />
            </div>
            <div>
              <Label htmlFor="secondaryButtonLink">Secondary Button Link (Optional)</Label>
              <Input
                id="secondaryButtonLink"
                value={formData.secondaryButtonLink}
                onChange={(e) => setFormData({ ...formData, secondaryButtonLink: e.target.value })}
                placeholder="https://example.com (optional)"
              />
            </div>
          </div>

          <div>
            <Label>Images</Label>
            <div className="space-y-2">
              {formData.images.map((image, index) => (
                <div key={index} className="flex gap-2">
                  <Input value={image} readOnly />
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeImage(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  placeholder="Add image URL"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                />
                <Button onClick={addImage}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full">
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default HeroContent;
