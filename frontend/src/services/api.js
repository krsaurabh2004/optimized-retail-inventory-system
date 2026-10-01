import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor to attach Authorization Header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for Unauthorized token handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me')
};

// Product Services
export const productService = {
  getProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`)
};

// Supplier Services
export const supplierService = {
  getSuppliers: (params) => api.get('/suppliers', { params }),
  getSupplierById: (id) => api.get(`/suppliers/${id}`),
  createSupplier: (data) => api.post('/suppliers', data),
  updateSupplier: (id, data) => api.put(`/suppliers/${id}`, data),
  deleteSupplier: (id) => api.delete(`/suppliers/${id}`)
};

// Sales Services
export const saleService = {
  createSale: (data) => api.post('/sales', data),
  getSales: (params) => api.get('/sales', { params }),
  getSaleById: (id) => api.get(`/sales/${id}`)
};

// Inventory Services
export const inventoryService = {
  getInventory: (params) => api.get('/inventory', { params }),
  getLowStock: () => api.get('/inventory/low-stock'),
  getOutOfStock: () => api.get('/inventory/out-of-stock'),
  getTransactions: (params) => api.get('/inventory/transactions', { params }),
  adjustStock: (data) => api.post('/inventory/adjust', data)
};

// Optimization Services
export const optimizationService = {
  getOptimization: () => api.get('/optimization'),
  generateRecommendations: () => api.post('/optimization/generate-recommendations'),
  getRecommendations: (params) => api.get('/optimization/recommendations', { params }),
  updateRecommendationStatus: (id, status) => api.put(`/optimization/recommendations/${id}`, { status })
};

// Dashboard Services
export const dashboardService = {
  getStats: () => api.get('/dashboard')
};

// Report Services
export const reportService = {
  getReportData: (params) => api.get('/reports', { params })
};

export default api;
