"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

interface User {
    id: number;
    name: string;
    email: string;
    has_completed_onboarding: boolean;
    company_id?: number;
    company?: {
        id: number;
        company_name: string;
        currency: string;
        logo_path?: string;
        settings?: {
            primary_color?: string;
            secondary_color?: string;
        };
    };
    role?: {
        name: string;
        permissions: Array<{ name: string }>;
    };
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    updateUser: (user: User) => void;
    can: (permission: string) => boolean;
    isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedToken = sessionStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            fetchUser();
        } else {
            setIsLoading(false);
        }
    }, []);

    const fetchUser = async () => {
        try {
            const { data } = await api.get('/user');
            setUser(data);
        } catch (error) {
            sessionStorage.removeItem('token');
            setToken(null);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = (newToken: string, userData: User) => {
        sessionStorage.setItem('token', newToken);
        if (userData.company) {
            sessionStorage.setItem('company', JSON.stringify(userData.company));
        }
        setToken(newToken);
        setUser(userData);
        // Small delay to let providers react to state change before navigation
        setTimeout(() => {
            router.push('/');
        }, 100);
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            // ignore error on logout
        } finally {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('company');
            setToken(null);
            setUser(null);
            window.location.href = '/login';
        }
    };

    const updateUser = (userData: User) => {
        setUser(userData);
        if (userData.company) {
            sessionStorage.setItem('company', JSON.stringify(userData.company));
        }
    };

    const can = (permission: string) => {
        if (!user) return false;
        if (user.role?.name === 'Admin') return true;
        return user.role?.permissions?.some(p => p.name === permission) || false;
    };

    const isAdmin = () => {
        return user?.role?.name === 'Admin';
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUser, can, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
