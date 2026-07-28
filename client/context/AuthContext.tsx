import { createContext, useState, useEffect, type ReactNode } from 'react';
import axios, { type AxiosError, type AxiosInstance } from 'axios';
import { toast } from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';
import type { AxiosInstance as AxiosInstanceType } from 'axios';
import type { IUser } from '../src/types/user.types.js'
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://realtimechat-app-q11p.onrender.com';
axios.defaults.baseURL = backendUrl;

const isAxiosError = (error: unknown): error is AxiosError => axios.isAxiosError(error);
export interface AuthCredentials {
    email: string;
    password: string;
    fullName?: string;
    bio?: string;
}

export interface updateProfile {
    fullName: string;
    bio: string;
    profilePic: string | null;

}

export interface AuthContextType {
    axios: AxiosInstanceType;
    authUser: IUser | null;
    onlineUsers: string[] | null;
    socket: Socket | null;
    login: (state: 'signup' | 'login', credentials: AuthCredentials) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (body: updateProfile) => Promise<void>;
}

export interface AuthProviderProps {
    children: ReactNode;
}
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"))
    const [authUser, setAuthUser] = useState<IUser | null>(null)
    const [onlineUsers, setOnlineUsers] = useState<string[] | null>([])
    const [socket, setSocket] = useState<Socket | null>(null)

    //check if user is auth
    const checkAuth = async () => {
        if (!token) {
            setAuthUser(null);
            return;
        }

        try {
            const { data } = await axios.get("/api/auth/check", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.success) {
                setAuthUser(data.user);
                connectSocket(data.user);
            }
        } catch (error: unknown) {
            if (isAxiosError(error) && error.response?.status === 401) {
                localStorage.removeItem("token");
                setToken(null);
                setAuthUser(null);
                return;
            }

            const axiosMessage = isAxiosError(error)
                ? (error.response?.data as { message?: string | undefined })?.message
                : undefined;

            const message = axiosMessage || (error instanceof Error ? error.message : 'An unexpected error occurred.');

            toast.error(message);
        }
    }
    //login function
    const login = async (state: 'signup' | 'login', credentials: AuthCredentials) => {
        try {
            const { data } = await axios.post(`/api/auth/${state}`, credentials)
            if (data?.success) {
                setAuthUser(data.user);
                connectSocket(data.user);
                axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
                setToken(data.token);
                localStorage.setItem("token", data.token)
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }
        } catch (error: unknown) {
            const axiosMessage = isAxiosError(error)
                ? (error.response?.data as { message?: string | undefined })?.message
                : undefined;

            const message = axiosMessage || (error instanceof Error ? error.message : 'An unexpected error occurred.');

            toast.error(message);
        }
    }

    const logout = async () => {
        localStorage.removeItem("token");
        setToken(null)
        setAuthUser(null)
        setOnlineUsers([]);
        delete axios.defaults.headers.common["Authorization"]
        toast.success("Logout Success")
        socket?.disconnect();
    }

    //to update profile
    const updateProfile = async (body: updateProfile) => {
        try {
            const { data } = await axios.put("/api/auth/update-profile", body);
            if (data.success) {
                setAuthUser(data.user);
                toast.success("Profile updated successfully")
            }

        }
        catch (error: unknown) {
            const axiosMessage = isAxiosError(error)
                ? (error.response?.data as { message?: string | undefined })?.message
                : undefined;

            const message = axiosMessage || (error instanceof Error ? error.message : 'An unexpected error occurred.');

            toast.error(message);
        }
    }


    //socket conection and user updates
    const connectSocket = (userData: IUser) => {
        if (!userData || socket?.connected) return;
        const newSocket: Socket = io(backendUrl, {
            query: {
                userId: userData._id,
            }
        })
        newSocket.connect();
        setSocket(newSocket);
        newSocket.on("getOnlineUsers", (userIds: string[]) => {
            setOnlineUsers(userIds)
        })
    }

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }
        checkAuth();
    }, []);


    const value = { axios, authUser, onlineUsers, socket, login, logout, updateProfile };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
} 