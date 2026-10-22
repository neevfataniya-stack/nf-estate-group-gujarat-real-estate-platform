import {
  Property,
  User,
  Enquiry,
  SiteVisitRequest,
  SellerSubmission,
  AdminStats,
} from '../types';

const TOKEN_KEY = 'nf_estate_auth_token';

export const api = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }

    return data as T;
  },

  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string; message: string }> {
    const data = await this.request<{ user: User; token: string; message: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  },

  async register(params: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    consent: boolean;
  }): Promise<{ user: User; token: string; message: string }> {
    const data = await this.request<{ user: User; token: string; message: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    this.setToken(data.token);
    return data;
  },

  async getMe(): Promise<{ user: User | null }> {
    try {
      return await this.request<{ user: User | null }>('/api/auth/me');
    } catch {
      this.clearToken();
      return { user: null };
    }
  },

  async logout(): Promise<void> {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } finally {
      this.clearToken();
    }
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Properties
  async getProperties(params?: Record<string, any>): Promise<{ total: number; properties: Property[] }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          query.append(k, String(v));
        }
      });
    }
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ total: number; properties: Property[] }>(`/api/properties${qs}`);
  },

  async getPropertyById(id: string): Promise<{ property: Property }> {
    return this.request<{ property: Property }>(`/api/properties/${id}`);
  },

  async createProperty(property: Partial<Property>): Promise<{ message: string; property: Property }> {
    return this.request<{ message: string; property: Property }>('/api/properties', {
      method: 'POST',
      body: JSON.stringify(property),
    });
  },

  async updateProperty(id: string, updates: Partial<Property>): Promise<{ message: string; property: Property }> {
    return this.request<{ message: string; property: Property }>(`/api/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteProperty(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/properties/${id}`, {
      method: 'DELETE',
    });
  },

  // Enquiries
  async submitEnquiry(enquiry: Record<string, any>): Promise<{ message: string; enquiry: Enquiry }> {
    return this.request<{ message: string; enquiry: Enquiry }>('/api/enquiries', {
      method: 'POST',
      body: JSON.stringify(enquiry),
    });
  },

  async getMyEnquiries(): Promise<{ enquiries: Enquiry[] }> {
    return this.request<{ enquiries: Enquiry[] }>('/api/enquiries/my');
  },

  // Site visits
  async submitSiteVisit(data: {
    propertyId: string;
    propertyTitle: string;
    preferredDate: string;
    preferredTimeSlot: string;
    notes?: string;
  }): Promise<{ message: string; visit: SiteVisitRequest }> {
    return this.request<{ message: string; visit: SiteVisitRequest }>('/api/site-visits', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMySiteVisits(): Promise<{ visits: SiteVisitRequest[] }> {
    return this.request<{ visits: SiteVisitRequest[] }>('/api/site-visits/my');
  },

  // Seller submissions
  async submitSellerListing(data: Record<string, any>): Promise<{ message: string; submission: SellerSubmission }> {
    return this.request<{ message: string; submission: SellerSubmission }>('/api/seller-submissions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Saved properties
  async getSavedProperties(): Promise<{ ids: string[]; properties: Property[] }> {
    return this.request<{ ids: string[]; properties: Property[] }>('/api/saved-properties');
  },

  async toggleSavedProperty(propertyId: string): Promise<{ saved: boolean; ids: string[] }> {
    return this.request<{ saved: boolean; ids: string[] }>('/api/saved-properties/toggle', {
      method: 'POST',
      body: JSON.stringify({ propertyId }),
    });
  },

  // Admin
  async getAdminStats(): Promise<{ stats: AdminStats }> {
    return this.request<{ stats: AdminStats }>('/api/admin/overview');
  },

  async getAdminEnquiries(params?: Record<string, any>): Promise<{ enquiries: Enquiry[] }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          query.append(k, String(v));
        }
      });
    }
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ enquiries: Enquiry[] }>(`/api/admin/enquiries${qs}`);
  },

  async updateEnquiryStatus(id: string, status: string, internalNotes?: string): Promise<{ message: string; enquiry: Enquiry }> {
    return this.request<{ message: string; enquiry: Enquiry }>(`/api/admin/enquiries/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, internalNotes }),
    });
  },

  async getAdminSiteVisits(): Promise<{ visits: SiteVisitRequest[] }> {
    return this.request<{ visits: SiteVisitRequest[] }>('/api/admin/site-visits');
  },

  async updateSiteVisitStatus(id: string, status: string): Promise<{ message: string; visit: SiteVisitRequest }> {
    return this.request<{ message: string; visit: SiteVisitRequest }>(`/api/admin/site-visits/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async getAdminSellerSubmissions(): Promise<{ submissions: SellerSubmission[] }> {
    return this.request<{ submissions: SellerSubmission[] }>('/api/admin/seller-submissions');
  },

  async updateSellerSubmissionStatus(id: string, status: string): Promise<{ message: string; submission: SellerSubmission }> {
    return this.request<{ message: string; submission: SellerSubmission }>(`/api/admin/seller-submissions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  getAdminExportUrl(): string {
    const token = this.getToken();
    return `/api/admin/export-enquiries${token ? `?auth=${token}` : ''}`;
  },
};
