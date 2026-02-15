// Axios
import axios from "axios";

// API URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4040";

// Create an Axios instance
const http = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default http;

// ============ API Modules ============

export const authAPI = {
  register: (data) => http.post("/api/auth/register", data),
  login: (data) => http.post("/api/auth/login", data),
  getMe: () => http.get("/api/auth/me"),
};

export const usersAPI = {
  getProfile: () => http.get("/api/users/me"),
  updateProfile: (data) => http.put("/api/users/me", data),
  setRegion: (data) => http.put("/api/users/region", data),
};

export const regionsAPI = {
  getAll: (params) => http.get("/api/regions", { params }),
  getById: (id) => http.get(`/api/regions/${id}`),
  create: (data) => http.post("/api/regions", data),
};

export const requestsAPI = {
  create: (data) => http.post("/api/requests", data),
  getMyRequests: () => http.get("/api/requests/my"),
  update: (id, data) => http.put(`/api/requests/${id}`, data),
};

export const servicesAPI = {
  getAll: () => http.get("/api/services"),
};

export const serviceReportsAPI = {
  create: (data) => http.post("/api/service-reports", data),
  getMyReports: () => http.get("/api/service-reports/my"),
  confirm: (id, data) => http.put(`/api/service-reports/${id}/confirm`, data),
};

export const mskAPI = {
  getCategories: () => http.get("/api/msk/categories"),
  createOrder: (data) => http.post("/api/msk/orders", data),
  getMyOrders: () => http.get("/api/msk/orders/my"),
  updateOrder: (id, data) => http.put(`/api/msk/orders/${id}`, data),
  confirmOrder: (id, data) => http.put(`/api/msk/orders/${id}/confirm`, data),
};
