import { toast } from "@/hooks/use-toast";

// Get API base URL from environment variable or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://arch-server-production-3f1e.up.railway.app/';

export interface ApiError {
  message: string;
  status: number;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private isRedirecting: boolean = false;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add Authorization header if token exists
    if (this.token) {
      defaultHeaders['Authorization'] = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
          
          // Prevent multiple redirects and don't redirect if already on login page
          if (!this.isRedirecting && !window.location.pathname.includes('/login')) {
            this.isRedirecting = true;
            window.location.href = '/login';
          }
        }
        
        const error = await response.json().catch(() => ({
          message: 'An error occurred',
        }));
        throw {
          message: error.message || 'Request failed',
          status: response.status,
        } as ApiError;
      }

      // Reset redirect flag on successful request
      this.isRedirecting = false;

      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      if ((error as ApiError).status) {
        throw error;
      }
      throw {
        message: 'Network error. Please check your connection.',
        status: 0,
      } as ApiError;
    }
  }

  setToken(token: string) {
    this.token = token;
    this.isRedirecting = false; // Reset redirect flag when setting token
    localStorage.setItem('authToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  getToken() {
    return this.token;
  }

  async login(email: string, password: string) {
    const response = await this.request<{ token: string; admin: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async logout() {
    await this.request('/api/auth/logout', {
      method: 'POST',
    });
    this.clearToken();
  }

  async getCurrentAdmin() {
    try {
      return await this.request<any>('/api/auth/me');
    } catch (error) {
      // Don't redirect on 401 for this specific call to prevent loops
      if ((error as ApiError).status === 401) {
        this.clearToken();
        throw error;
      }
      throw error;
    }
  }

  // Admin endpoints
  async getAdmins() {
    return this.request<any[]>('/api/admins');
  }

  async createAdmin(data: any) {
    return this.request<any>('/api/admins', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdmin(id: string, data: any) {
    return this.request<any>(`/api/admins/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAdmin(id: string) {
    return this.request(`/api/admins/${id}`, {
      method: 'DELETE',
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Logo endpoints
  async getLogos() {
    return this.request<any[]>('/api/logo/all');
  }

  async createLogo(data: any) {
    return this.request<any>('/api/logo', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLogo(id: string, data: any) {
    return this.request<any>(`/api/logo/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteLogo(id: string) {
    return this.request(`/api/logo/${id}`, {
      method: 'DELETE',
    });
  }

  // Hero Content endpoints
  async getHeroContent() {
    return this.request<any>('/api/content/hero');
  }

  async updateHeroContent(data: any) {
    return this.request<any>('/api/content/hero', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Service endpoints
  async getServices() {
    return this.request<any[]>('/api/services/admin');
  }

  async createService(data: any) {
    return this.request<any>('/api/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateService(id: string, data: any) {
    return this.request<any>(`/api/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteService(id: string) {
    return this.request(`/api/services/${id}`, {
      method: 'DELETE',
    });
  }

  async reorderServices(serviceIds: string[]) {
    return this.request('/api/services/reorder', {
      method: 'PUT',
      body: JSON.stringify({ serviceIds }),
    });
  }

  // Project endpoints
  async getProjects() {
    return this.request<any[]>('/api/projects');
  }

  async getAdminProjects() {
    return this.request<any[]>('/api/projects/admin');
  }

  async createProject(data: any) {
    return this.request<any>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(id: string, data: any) {
    return this.request<any>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: string) {
    return this.request(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleProjectStatus(id: string) {
    return this.request(`/api/projects/${id}/toggle`, {
      method: 'PUT',
    });
  }

  // Contact Info endpoints
  async getContactInfo() {
    return this.request<any>('/api/content/contact-info/admin');
  }

  async createContactInfo(data: any) {
    return this.request<any>('/api/content/contact-info', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateContactInfo(data: any) {
    return this.request<any>('/api/content/contact-info', {
      method: 'PUT',
      body: JSON.stringify({ items: data }),
    });
  }

  async updateContactInfoItem(id: string, data: any) {
    return this.request<any>(`/api/content/contact-info/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteContactInfoItem(id: string) {
    return this.request(`/api/content/contact-info/${id}`, {
      method: 'DELETE',
    });
  }

  // Social Links endpoints
  async getSocialLinks() {
    return this.request<any[]>('/api/content/social-links/admin');
  }

  async createSocialLink(data: any) {
    return this.request<any>('/api/content/social-links', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSocialLink(id: string, data: any) {
    return this.request<any>(`/api/content/social-links/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSocialLink(id: string) {
    return this.request(`/api/content/social-links/${id}`, {
      method: 'DELETE',
    });
  }

  async updateSocialLinks(data: any[]) {
    return this.request<any>('/api/content/social-links', {
      method: 'PUT',
      body: JSON.stringify({ items: data }),
    });
  }

  // Footer Content endpoints
  async getFooterContent() {
    return this.request<any>('/api/content/footer');
  }

  async updateFooterContent(data: any) {
    return this.request<any>('/api/content/footer', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Contact Messages endpoints
  async getContactMessages() {
    return this.request<any[]>('/api/contact/messages');
  }

  async markMessageAsRead(id: string) {
    return this.request(`/api/contact/messages/${id}/read`, {
      method: 'PUT',
    });
  }

  async deleteContactMessage(id: string) {
    return this.request(`/api/contact/messages/${id}`, {
      method: 'DELETE',
    });
  }

  // Audit Log endpoints
  async getAuditLogs(filters?: { action?: string; startDate?: string; endDate?: string }) {
    const params = new URLSearchParams();
    if (filters?.action) params.append('action', filters.action);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const queryString = params.toString();
    return this.request<any[]>(`/api/admins/audit-logs${queryString ? `?${queryString}` : ''}`);
  }

  // Media upload endpoint
  async uploadMedia(file: File, folder?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);

    return this.request<{ url: string }>('/api/media/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  async deleteMedia(url: string) {
    return this.request('/api/media', {
      method: 'DELETE',
      body: JSON.stringify({ url }),
    });
  }
}

export const api = new ApiClient(API_BASE_URL);

// Helper function to handle API errors with toast notifications
export const handleApiError = (error: unknown) => {
  const apiError = error as ApiError;
  toast({
    title: "Error",
    description: apiError.message || "An unexpected error occurred",
    variant: "destructive",
  });
};
