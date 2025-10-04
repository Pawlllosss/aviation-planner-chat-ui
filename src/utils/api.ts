import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // You can add auth tokens here if needed
        // const token = localStorage.getItem('token');
        // if (token) {
        //     config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle common errors here
        if (error.response?.status === 401) {
            // Handle unauthorized
        }
        return Promise.reject(error);
    }
);

export const api = {
    get: async <T = any>(url: string, config?: any): Promise<T> => {
        const response = await axiosInstance.get(url, config);
        return response.data;
    },

    post: async <T = any>(url: string, data?: any, config?: any): Promise<T> => {
        const response = await axiosInstance.post(url, data, config);
        return response.data;
    },

    put: async <T = any>(url: string, data?: any, config?: any): Promise<T> => {
        const response = await axiosInstance.put(url, data, config);
        return response.data;
    },

    patch: async <T = any>(url: string, data?: any, config?: any): Promise<T> => {
        const response = await axiosInstance.patch(url, data, config);
        return response.data;
    },

    delete: async <T = any>(url: string, config?: any): Promise<T> => {
        const response = await axiosInstance.delete(url, config);
        return response.data;
    },
};

export default api;
