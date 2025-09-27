import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import axios, { AxiosInstance, AxiosError } from 'axios';
import toast from 'react-hot-toast';

export interface User {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    preferences: {
        theme: 'light' | 'dark';
        language: string;
        notifications: boolean;
        soundEnabled: boolean;
    };
    lastActive: string;
    createdAt: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (userData: RegisterData) => Promise<void>;
    logout: () => void;
    updateProfile: (data: UpdateProfileData) => Promise<void>;
    axiosInstance: AxiosInstance;
}

interface RegisterData {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
}

interface UpdateProfileData {
    firstName?: string;
    lastName?: string;
    preferences?: Partial<User['preferences']>;
}

interface AuthResponse {
    token: string;
    user: User;
    message: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Create axios instance with interceptors
    const axiosInstance = axios.create({
        baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
        timeout: 10000,
    });

    // Request interceptor to add auth token
    axiosInstance.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('authToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Response interceptor to handle auth errors
    axiosInstance.interceptors.response.use(
        (response) => response,
        (error: AxiosError) => {
            if (error.response?.status === 401) {
                // Token expired or invalid
                logout();
                toast.error('Session expired. Please login again.');
            } else if (error.response && error.response.status >= 500) {
                toast.error('Server error. Please try again later.');
            }
            return Promise.reject(error);
        }
    );

    const login = async (email: string, password: string): Promise<void> => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.post<AuthResponse>('/auth/login', {
                email,
                password,
            });

            const { token, user: userData } = response.data;

            localStorage.setItem('authToken', token);
            setUser(userData);

            toast.success('Logged in successfully!');
        } catch (error: any) {
            const message = error.response?.data?.error || 'Login failed';
            toast.error(message);
            throw new Error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData: RegisterData): Promise<void> => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.post<AuthResponse>('/auth/register', userData);

            const { token, user: newUser } = response.data;

            localStorage.setItem('authToken', token);
            setUser(newUser);

            toast.success('Account created successfully!');
        } catch (error: any) {
            const message = error.response?.data?.error || 'Registration failed';
            if (error.response?.data?.details) {
                // Handle validation errors
                const details = error.response.data.details;
                const errorMessages = details.map((detail: any) => detail.message).join(', ');
                toast.error(errorMessages);
                throw new Error(errorMessages);
            } else {
                toast.error(message);
                throw new Error(message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const logout = (): void => {
        localStorage.removeItem('authToken');
        setUser(null);

        // Call logout endpoint to invalidate server-side session
        axiosInstance.post('/auth/logout').catch(() => {
            // Ignore errors on logout
        });

        toast.success('Logged out successfully');
    };

    const updateProfile = async (data: UpdateProfileData): Promise<void> => {
        if (!user) throw new Error('User not authenticated');

        try {
            const response = await axiosInstance.put('/auth/profile', data);
            const { user: updatedUser } = response.data;

            setUser(updatedUser);
            toast.success('Profile updated successfully!');
        } catch (error: any) {
            const message = error.response?.data?.error || 'Failed to update profile';
            toast.error(message);
            throw new Error(message);
        }
    };

    // Check authentication status on app load
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await axiosInstance.get<{ user: User }>('/auth/me');
                setUser(response.data.user);
            } catch (error) {
                // Token invalid, remove it
                localStorage.removeItem('authToken');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const contextValue: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        axiosInstance,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}