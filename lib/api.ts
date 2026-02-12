const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Request failed',
          errors: data.errors,
        };
      }

      return data;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Network error',
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Auth API
export const authApi = {
  register: (data: { name: string; email: string; password: string; role?: string }) =>
    apiClient.post<{ token: string; user: any }>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<{ token: string; user: any }>('/auth/login', data),

  getMe: () => apiClient.get<any>('/auth/me'),

  vendorOnboard: (data: any) =>
    apiClient.post('/auth/vendor/onboard', data),
};

// Cars API
export const carsApi = {
  getAll: (params?: {
    lat?: number;
    lng?: number;
    radius?: number;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    city?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query.append(key, value.toString());
        }
      });
    }
    return apiClient.get<{ data: any[]; total: number; page: number; pages: number }>(
      `/cars?${query.toString()}`
    );
  },

  getById: (id: string) => apiClient.get<any>(`/cars/${id}`),

  getVendorCars: (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query.append(key, value.toString());
        }
      });
    }
    return apiClient.get<{ data: any[]; total: number }>(`/cars/vendor?${query.toString()}`);
  },

  create: (data: any) => apiClient.post('/cars', data),

  update: (id: string, data: any) => apiClient.put(`/cars/${id}`, data),

  delete: (id: string) => apiClient.delete(`/cars/${id}`),
};

// Bookings API
export const bookingsApi = {
  create: (data: {
    car: string;
    startDate: string;
    endDate: string;
    pickupLocation?: any;
    notes?: string;
  }) => apiClient.post<any>('/bookings', data),

  getUserBookings: (params?: { status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query.append(key, value.toString());
        }
      });
    }
    return apiClient.get<{ data: any[]; total: number }>(`/bookings/user?${query.toString()}`);
  },

  getVendorBookings: (params?: { status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query.append(key, value.toString());
        }
      });
    }
    return apiClient.get<{ data: any[]; total: number }>(`/bookings/vendor?${query.toString()}`);
  },

  getById: (id: string) => apiClient.get<any>(`/bookings/${id}`),

  cancel: (id: string, reason?: string) =>
    apiClient.put(`/bookings/${id}/cancel`, { reason }),
};

// Payments API
export const paymentsApi = {
  createSession: (data: {
    bookingId: string;
    successUrl: string;
    cancelUrl: string;
  }) => apiClient.post<{ sessionId: string; url: string }>('/payments/create-session', data),
};

// Admin API
export const adminApi = {
  getAnalytics: (params?: { startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query.append(key, value.toString());
        }
      });
    }
    return apiClient.get<any>(`/admin/analytics?${query.toString()}`);
  },

  getVendors: (params?: { approved?: boolean; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query.append(key, value.toString());
        }
      });
    }
    return apiClient.get<{ data: any[]; total: number }>(`/admin/vendors?${query.toString()}`);
  },

  approveVendor: (id: string) => apiClient.put(`/admin/vendors/${id}/approve`),

  getCars: (params?: { approved?: boolean; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query.append(key, value.toString());
        }
      });
    }
    return apiClient.get<{ data: any[]; total: number }>(`/admin/cars?${query.toString()}`);
  },

  approveCar: (id: string) => apiClient.put(`/admin/cars/${id}/approve`),
};

