import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // Token will be added here when auth is implemented
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      if (status === 401) {
        // Handle unauthorized - redirect to login
        if (typeof window !== "undefined") {
          window.location.href = "/auth/signin";
        }
      }

      // Return structured error
      return Promise.reject({
        status,
        code: data?.error?.code || "UNKNOWN_ERROR",
        message: data?.error?.message || "An error occurred",
        details: data?.error?.details || {},
      });
    }

    // Network error or request cancelled
    return Promise.reject({
      status: 0,
      code: "NETWORK_ERROR",
      message: "Unable to connect to the server",
      details: {},
    });
  }
);

export default api;
