import axios from 'axios';
import { toast } from "sonner";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true,
});

// Request interceptor to attach token
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = sessionStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!error.response) {
            // Network error (server is down or connection refused)
            console.error('Network Error Details:', {
                message: error.message,
                config: error.config,
                code: error.code,
                request: error.request
            });

            if (typeof window !== 'undefined') {
                const url = error.config?.baseURL + (error.config?.url || '');
                toast.error(`Network Error: Backend unreachable at ${url}. Check Render/Vercel Env Vars and CORS logs.`, {
                    duration: 10000,
                    id: "network-error"
                });
            }
        } else if (error.response.status === 401) {
            if (typeof window !== 'undefined') {
                sessionStorage.removeItem('token');
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
