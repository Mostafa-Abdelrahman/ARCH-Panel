import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api, handleApiError } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit, Eye, Code } from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    serviceid: '',
    description: '',
    fullDescription: '',
    location: '',
    year: '',
    area: '',
    client: '',
    status: '',
    coverImage: '',
    images: [] as string[],
    tags: [] as string[],
    features: [] as string[],
    order: 0,
    isActive: true,
  });
  const [newItem, setNewItem] = useState({ images: '', tags: '', features: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [projectsResponse, servicesResponse] = await Promise.all([
        api.getAdminProjects(), // Use admin endpoint to get all projects
        api.getServices(),
      ]);
      
      // Handle projects response
      let projectData: any[] = [];
      if (projectsResponse && typeof projectsResponse === 'object') {
        if ('success' in projectsResponse && 'data' in projectsResponse && projectsResponse.success) {
          projectData = (projectsResponse as any).data || [];
        } else if (Array.isArray(projectsResponse)) {
          projectData = projectsResponse;
        }
      }
      
      // Handle services response
      let serviceData: any[] = [];
      if (servicesResponse && typeof servicesResponse === 'object') {
        if ('success' in servicesResponse && 'data' in servicesResponse && servicesResponse.success) {
          serviceData = (servicesResponse as any).data || [];
        } else if (Array.isArray(servicesResponse)) {
          serviceData = servicesResponse;
        }
      }
      
      setProjects(Array.isArray(projectData) ? projectData : []);
      setServices(Array.isArray(serviceData) ? serviceData : []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      handleApiError(error);
      setProjects([]);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!formData.title.trim() || !formData.serviceid || !formData.description.trim() || 
          !formData.status.trim() || !formData.coverImage.trim()) {
        toast({ 
          title: 'Error', 
          description: 'Title, service, description, status, and cover image are required',
          variant: 'destructive' 
        });
        return;
      }

      const projectData = {
        title: formData.title.trim(),
        serviceid: formData.serviceid,
        description: formData.description.trim(),
        fullDescription: formData.fullDescription.trim(),
        location: formData.location.trim() || null,
        year: formData.year.trim() || null,
        area: formData.area.trim() || null,
        client: formData.client.trim() || null,
        status: formData.status.trim(),
        coverImage: formData.coverImage.trim(),
        images: formData.images,
        tags: formData.tags,
        features: formData.features,
        order: formData.order,
        isActive: formData.isActive
      };

      if (editingProject) {
        await api.updateProject(editingProject.id, projectData);
        toast({ title: 'Success', description: 'Project updated successfully' });
      } else {
        await api.createProject(projectData);
        toast({ title: 'Success', description: 'Project created successfully' });
      }
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      await api.deleteProject(id);
      toast({ title: 'Success', description: 'Project deleted successfully' });
      loadData();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await api.toggleProjectStatus(id);
      toast({ title: 'Success', description: 'Project status updated successfully' });
      loadData();
    } catch (error) {
      handleApiError(error);
    }
  };

  const openEditDialog = (project: any) => {
    setEditingProject(project);
    setFormData({
      title: project.title || '',
      serviceid: project.serviceid || '',
      description: project.description || '',
      fullDescription: project.fullDescription || '',
      location: project.location || '',
      year: project.year || '',
      area: project.area || '',
      client: project.client || '',
      status: project.status || '',
      coverImage: project.coverImage || '',
      images: project.images || [],
      tags: project.tags || [],
      features: project.features || [],
      order: project.order || 0,
      isActive: project.isActive !== undefined ? project.isActive : true,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      serviceid: '',
      description: '',
      fullDescription: '',
      location: '',
      year: '',
      area: '',
      client: '',
      status: '',
      coverImage: '',
      images: [],
      tags: [],
      features: [],
      order: 0,
      isActive: true,
    });
  };

  const addArrayItem = (field: 'images' | 'tags' | 'features') => {
    if (newItem[field].trim()) {
      setFormData({
        ...formData,
        [field]: [...formData[field], newItem[field]],
      });
      setNewItem({ ...newItem, [field]: '' });
    }
  };

  const removeArrayItem = (field: 'images' | 'tags' | 'features', index: number) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Manage your portfolio projects</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span className="sm:hidden">Add</span>
              <span className="hidden sm:inline">Add Project</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{editingProject ? 'Edit Project' : 'Create New Project'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Project title"
                  />
                </div>
                <div>
                  <Label htmlFor="serviceid">Service *</Label>
                  <Select value={formData.serviceid} onValueChange={(value) => setFormData({ ...formData, serviceid: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(services) && services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.title || service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Brief project description"
                />
              </div>
              
              <div>
                <Label htmlFor="fullDescription">Full Description</Label>
                <Tabs defaultValue="edit" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="edit" className="flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      HTML Editor
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Preview
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="edit" className="mt-2">
                    <Textarea
                      id="fullDescription"
                      value={formData.fullDescription}
                      onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                      rows={6}
                      placeholder="Enter HTML content for detailed project description"
                      className="font-mono text-sm"
                    />
                    <div className="mt-2 text-xs text-muted-foreground">
                      You can use HTML tags like &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;br&gt;, etc.
                    </div>
                  </TabsContent>
                  <TabsContent value="preview" className="mt-2">
                    <div className="border rounded-md p-4 min-h-[150px] bg-background">
                      {formData.fullDescription ? (
                        <div 
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: formData.fullDescription }}
                          style={{
                            fontSize: '14px',
                            lineHeight: '1.6',
                            color: 'inherit'
                          }}
                        />
                      ) : (
                        <div className="text-muted-foreground italic">
                          Preview will appear here when you add HTML content...
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Project location"
                  />
                </div>
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="Project year"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="area">Area</Label>
                  <Input
                    id="area"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="Project area"
                  />
                </div>
                <div>
                  <Label htmlFor="client">Client</Label>
                  <Input
                    id="client"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    placeholder="Client name"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="coverImage">Cover Image URL *</Label>
                <Input
                  id="coverImage"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  placeholder="Cover image URL"
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

              {(['images', 'tags', 'features'] as const).map((field) => (
                <div key={field}>
                  <Label className="capitalize">{field}</Label>
                  <div className="space-y-2">
                    {formData[field].map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <Input value={item} readOnly />
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => removeArrayItem(field, index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Input
                        placeholder={`Add ${field.slice(0, -1)}`}
                        value={newItem[field]}
                        onChange={(e) => setNewItem({ ...newItem, [field]: e.target.value })}
                      />
                      <Button onClick={() => addArrayItem(field)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              <Button onClick={handleSave} className="w-full">
                {editingProject ? 'Update' : 'Create'} Project
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.isArray(projects) && projects.length > 0 ? (
          projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{project.title}</span>
                  <div className="flex items-center gap-2">
                    {project.order !== undefined && (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                        #{project.order}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded ${
                      project.isActive 
                        ? 'bg-success text-success-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {project.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {project.coverImage && (
                  <div className="h-32 overflow-hidden rounded bg-muted">
                    <img
                      src={project.coverImage}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                  {project.fullDescription && (
                    <div className="border-t pt-2">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Full Description:</p>
                      <div 
                        className="text-xs text-muted-foreground line-clamp-3 prose prose-xs max-w-none"
                        dangerouslySetInnerHTML={{ __html: project.fullDescription }}
                        style={{
                          fontSize: '12px',
                          lineHeight: '1.4'
                        }}
                      />
                    </div>
                  )}
                  {project.service && (
                    <p className="text-xs text-muted-foreground">
                      Service: {project.service.title || project.service.name}
                    </p>
                  )}
                  {project.status && (
                    <p className="text-xs text-muted-foreground">
                      Status: <span className="capitalize">{project.status}</span>
                    </p>
                  )}
                  {(project.location || project.year || project.client) && (
                    <div className="text-xs text-muted-foreground space-y-1">
                      {project.location && <p>Location: {project.location}</p>}
                      {project.year && <p>Year: {project.year}</p>}
                      {project.client && <p>Client: {project.client}</p>}
                    </div>
                  )}
                </div>
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {project.tags.slice(0, 3).map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {project.tags.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{project.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(project)} className="flex-1 sm:flex-none">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant={project.isActive ? "secondary" : "outline"} 
                    size="sm" 
                    onClick={() => handleToggleStatus(project.id)}
                    className="flex-1 sm:flex-none text-xs sm:text-sm"
                  >
                    {project.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(project.id)} className="sm:w-auto">
                    <Trash2 className="h-4 w-4" />
                    <span className="sm:hidden ml-1">Delete</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No projects found
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
