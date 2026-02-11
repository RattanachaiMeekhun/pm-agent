import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding the auth token
api.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (e.g., redirect to login)
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        // specific logic to redirect to login or clear token
        // localStorage.removeItem('token');
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
