import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

export interface Message {
    id: string;
    conversationId: string;
    userId?: string;
    content: string;
    role: 'user' | 'assistant';
    type: 'text' | 'image' | 'file' | 'system';
    status: 'sending' | 'sent' | 'delivered' | 'error';
    createdAt: string;
    isEdited?: boolean;
    editedAt?: string;
    metadata?: Record<string, any>;
    user?: {
        username: string;
        firstName?: string;
        lastName?: string;
        avatar?: string;
    };
}

export interface Conversation {
    id: string;
    title: string;
    userId: string;
    lastMessageAt: string;
    messageCount: number;
    isActive: boolean;
    settings: {
        personality: string;
        temperature: number;
        maxTokens: number;
    };
    createdAt: string;
    messages?: Message[];
}

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    joinConversation: (conversationId: string) => void;
    leaveConversation: (conversationId: string) => void;
    sendMessage: (conversationId: string, content: string, type?: string) => void;
    startTyping: (conversationId: string) => void;
    stopTyping: (conversationId: string) => void;
    onlineUsers: string[];
    connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'reconnecting';
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
    children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<SocketContextType['connectionStatus']>('disconnected');

    const { user, isAuthenticated } = useAuth();

    // Initialize socket connection
    useEffect(() => {
        if (!isAuthenticated || !user) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
                setConnectionStatus('disconnected');
            }
            return;
        }

        const token = localStorage.getItem('authToken');
        if (!token) return;

        setConnectionStatus('connecting');

        const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
            auth: {
                token,
            },
            transports: ['websocket', 'polling'],
            timeout: 20000,
        });

        // Connection event handlers
        newSocket.on('connect', () => {
            console.log('Connected to server');
            setIsConnected(true);
            setConnectionStatus('connected');
        });

        newSocket.on('disconnect', (reason) => {
            console.log('Disconnected from server:', reason);
            setIsConnected(false);
            setConnectionStatus('disconnected');

            if (reason === 'io server disconnect') {
                // Server disconnected the socket, don't reconnect automatically
                toast.error('Disconnected from server');
            }
        });

        newSocket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            setConnectionStatus('disconnected');

            if (error.message.includes('Authentication error')) {
                toast.error('Authentication failed. Please login again.');
            } else {
                toast.error('Failed to connect to server');
            }
        });

        newSocket.on('reconnect', (attemptNumber) => {
            console.log('Reconnected to server after', attemptNumber, 'attempts');
            setConnectionStatus('connected');
            toast.success('Reconnected to server');
        });

        newSocket.on('reconnect_attempt', (attemptNumber) => {
            console.log('Reconnection attempt', attemptNumber);
            setConnectionStatus('reconnecting');
        });

        newSocket.on('reconnect_error', (error) => {
            console.error('Reconnection error:', error);
            setConnectionStatus('disconnected');
        });

        newSocket.on('reconnect_failed', () => {
            console.error('Reconnection failed');
            setConnectionStatus('disconnected');
            toast.error('Failed to reconnect to server');
        });

        // Message event handlers
        newSocket.on('new_message', (data: { message: Message; user?: any }) => {
            // Handled by individual components
            console.log('New message received:', data);
        });

        newSocket.on('ai_message_start', (data: { messageId: string; conversationId: string }) => {
            console.log('AI message started:', data);
        });

        newSocket.on('ai_message_chunk', (data: { messageId: string; chunk: string; conversationId: string }) => {
            // Handled by message components for streaming
            console.log('AI message chunk:', data.chunk);
        });

        newSocket.on('ai_message_complete', (data: { message: Message; conversationId: string }) => {
            console.log('AI message completed:', data);
        });

        newSocket.on('ai_message_error', (data: { messageId: string; error: string; conversationId: string }) => {
            console.error('AI message error:', data);
            toast.error('Failed to generate AI response');
        });

        // Typing indicators
        newSocket.on('user_typing', (data: { userId: string; username: string; conversationId: string }) => {
            console.log('User typing:', data);
        });

        newSocket.on('user_stopped_typing', (data: { userId: string; conversationId: string }) => {
            console.log('User stopped typing:', data);
        });

        newSocket.on('ai_typing', (data: { conversationId: string }) => {
            console.log('AI typing in conversation:', data.conversationId);
        });

        newSocket.on('ai_stopped_typing', (data: { conversationId: string }) => {
            console.log('AI stopped typing in conversation:', data.conversationId);
        });

        // User presence
        newSocket.on('user_online', (data: { userId: string; username: string }) => {
            console.log('User came online:', data);
            setOnlineUsers(prev => [...prev.filter(id => id !== data.userId), data.userId]);
        });

        newSocket.on('user_offline', (data: { userId: string; username: string }) => {
            console.log('User went offline:', data);
            setOnlineUsers(prev => prev.filter(id => id !== data.userId));
        });

        // Error handling
        newSocket.on('error', (error: { message: string }) => {
            console.error('Socket error:', error);
            toast.error(error.message);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [isAuthenticated, user]);

    // Socket methods
    const joinConversation = (conversationId: string) => {
        if (socket && isConnected) {
            socket.emit('join_conversation', conversationId);
        }
    };

    const leaveConversation = (conversationId: string) => {
        if (socket && isConnected) {
            socket.emit('leave_conversation', conversationId);
        }
    };

    const sendMessage = (conversationId: string, content: string, type: string = 'text') => {
        if (socket && isConnected) {
            socket.emit('send_message', {
                conversationId,
                content,
                type,
            });
        } else {
            toast.error('Not connected to server. Please refresh the page.');
        }
    };

    const startTyping = (conversationId: string) => {
        if (socket && isConnected) {
            socket.emit('typing_start', { conversationId });
        }
    };

    const stopTyping = (conversationId: string) => {
        if (socket && isConnected) {
            socket.emit('typing_stop', { conversationId });
        }
    };

    const contextValue: SocketContextType = {
        socket,
        isConnected,
        joinConversation,
        leaveConversation,
        sendMessage,
        startTyping,
        stopTyping,
        onlineUsers,
        connectionStatus,
    };

    return (
        <SocketContext.Provider value={contextValue}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket(): SocketContextType {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
}