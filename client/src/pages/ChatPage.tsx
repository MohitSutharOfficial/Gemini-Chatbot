import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    TextField,
    IconButton,
    List,
    ListItem,
    Avatar,
    Chip,
    CircularProgress,
    Divider,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    Send,
    Add,
    MoreVert,
    Download,
    Search,
    Refresh
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useSocket, type Message, type Conversation } from '../contexts/SocketContext';
import MessageComponent from '../components/Chat/MessageComponent';
import ConversationList from '../components/Chat/ConversationList';
import TypingIndicator from '../components/Chat/TypingIndicator';
import toast from 'react-hot-toast';

function ChatPage() {
    const { conversationId } = useParams<{ conversationId: string }>();
    const navigate = useNavigate();

    const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageText, setMessageText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [aiTyping, setAiTyping] = useState(false);
    const [showNewChatDialog, setShowNewChatDialog] = useState(false);
    const [newChatTitle, setNewChatTitle] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout>();

    const { axiosInstance } = useAuth();
    const { socket, isConnected, joinConversation, leaveConversation, sendMessage, startTyping, stopTyping } = useSocket();

    // Scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Load conversation and messages
    useEffect(() => {
        if (!conversationId) return;

        const loadConversation = async () => {
            setIsLoading(true);
            try {
                const response = await axiosInstance.get(`/conversations/${conversationId}`);
                const conversation = response.data.conversation;

                setCurrentConversation(conversation);
                setMessages(conversation.messages || []);

                // Join the conversation room via socket
                joinConversation(conversationId);

            } catch (error: any) {
                console.error('Error loading conversation:', error);
                toast.error('Failed to load conversation');
                navigate('/chat');
            } finally {
                setIsLoading(false);
            }
        };

        loadConversation();

        return () => {
            if (conversationId) {
                leaveConversation(conversationId);
            }
        };
    }, [conversationId, axiosInstance, joinConversation, leaveConversation, navigate]);

    // Socket event handlers
    useEffect(() => {
        if (!socket || !conversationId) return;

        const handleNewMessage = (data: { message: Message; user?: any }) => {
            if (data.message.conversationId === conversationId) {
                setMessages(prev => [...prev, data.message]);
                scrollToBottom();
            }
        };

        const handleAiTyping = (data: { conversationId: string }) => {
            if (data.conversationId === conversationId) {
                setAiTyping(true);
            }
        };

        const handleAiStoppedTyping = (data: { conversationId: string }) => {
            if (data.conversationId === conversationId) {
                setAiTyping(false);
            }
        };

        const handleAiMessageStart = (data: { messageId: string; conversationId: string }) => {
            if (data.conversationId === conversationId) {
                // Add placeholder message for streaming
                const placeholderMessage: Message = {
                    id: data.messageId,
                    conversationId: data.conversationId,
                    content: '',
                    role: 'assistant',
                    type: 'text',
                    status: 'sending',
                    createdAt: new Date().toISOString(),
                };
                setMessages(prev => [...prev, placeholderMessage]);
            }
        };

        const handleAiMessageChunk = (data: { messageId: string; chunk: string; conversationId: string }) => {
            if (data.conversationId === conversationId) {
                setMessages(prev => prev.map(msg =>
                    msg.id === data.messageId
                        ? { ...msg, content: msg.content + data.chunk }
                        : msg
                ));
                scrollToBottom();
            }
        };

        const handleAiMessageComplete = (data: { message: Message; conversationId: string }) => {
            if (data.conversationId === conversationId) {
                setMessages(prev => prev.map(msg =>
                    msg.id === data.message.id ? data.message : msg
                ));
                setAiTyping(false);
            }
        };

        socket.on('new_message', handleNewMessage);
        socket.on('ai_typing', handleAiTyping);
        socket.on('ai_stopped_typing', handleAiStoppedTyping);
        socket.on('ai_message_start', handleAiMessageStart);
        socket.on('ai_message_chunk', handleAiMessageChunk);
        socket.on('ai_message_complete', handleAiMessageComplete);

        return () => {
            socket.off('new_message', handleNewMessage);
            socket.off('ai_typing', handleAiTyping);
            socket.off('ai_stopped_typing', handleAiStoppedTyping);
            socket.off('ai_message_start', handleAiMessageStart);
            socket.off('ai_message_chunk', handleAiMessageChunk);
            socket.off('ai_message_complete', handleAiMessageComplete);
        };
    }, [socket, conversationId]);

    // Handle sending messages
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!messageText.trim() || !conversationId || !isConnected) return;

        const content = messageText.trim();
        setMessageText('');

        // Stop typing indicator
        if (isTyping) {
            stopTyping(conversationId);
            setIsTyping(false);
        }

        // Send via socket for real-time updates
        sendMessage(conversationId, content);
    };

    // Handle typing indicators
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessageText(e.target.value);

        if (!conversationId || !isConnected) return;

        // Start typing indicator
        if (!isTyping) {
            startTyping(conversationId);
            setIsTyping(true);
        }

        // Reset typing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            if (isTyping) {
                stopTyping(conversationId);
                setIsTyping(false);
            }
        }, 1000);
    };

    // Create new conversation
    const handleCreateConversation = async () => {
        try {
            const response = await axiosInstance.post('/conversations', {
                title: newChatTitle.trim() || 'New Conversation'
            });

            const newConversation = response.data.conversation;
            setNewChatTitle('');
            setShowNewChatDialog(false);

            navigate(`/chat/${newConversation.id}`);
            toast.success('New conversation created!');
        } catch (error) {
            toast.error('Failed to create conversation');
        }
    };

    // Export conversation
    const handleExportConversation = async () => {
        if (!currentConversation) return;

        try {
            const response = await axiosInstance.get(
                `/conversations/${currentConversation.id}/export?format=json`,
                { responseType: 'blob' }
            );

            const blob = new Blob([response.data], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${currentConversation.title}.json`;
            link.click();
            window.URL.revokeObjectURL(url);

            toast.success('Conversation exported!');
        } catch (error) {
            toast.error('Failed to export conversation');
        }
    };

    return (
        <Box sx={{ height: '100%', display: 'flex' }}>
            {/* Conversation List Sidebar */}
            <Box
                sx={{
                    width: 300,
                    borderRight: 1,
                    borderColor: 'divider',
                    display: { xs: 'none', lg: 'block' }
                }}
            >
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Button
                        fullWidth
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setShowNewChatDialog(true)}
                    >
                        New Chat
                    </Button>
                </Box>
                <ConversationList currentConversationId={conversationId} />
            </Box>

            {/* Main Chat Area */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                {currentConversation ? (
                    <>
                        {/* Chat Header */}
                        <Paper
                            elevation={1}
                            sx={{
                                p: 2,
                                borderRadius: 0,
                                borderBottom: 1,
                                borderColor: 'divider'
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography variant="h6" noWrap>
                                        {currentConversation.title}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                        <Chip
                                            size="small"
                                            label={`${messages.length} messages`}
                                            variant="outlined"
                                        />
                                        <Chip
                                            size="small"
                                            label={isConnected ? 'Connected' : 'Disconnected'}
                                            color={isConnected ? 'success' : 'error'}
                                            variant="outlined"
                                        />
                                    </Box>
                                </Box>

                                <Box>
                                    <IconButton onClick={handleExportConversation}>
                                        <Download />
                                    </IconButton>
                                    <IconButton>
                                        <Search />
                                    </IconButton>
                                    <IconButton>
                                        <MoreVert />
                                    </IconButton>
                                </Box>
                            </Box>
                        </Paper>

                        {/* Messages Area */}
                        <Box
                            sx={{
                                flex: 1,
                                overflow: 'auto',
                                p: 2,
                                backgroundColor: 'background.default'
                            }}
                        >
                            {isLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <List sx={{ width: '100%' }}>
                                    {messages.map((message, index) => (
                                        <MessageComponent
                                            key={message.id}
                                            message={message}
                                            isLast={index === messages.length - 1}
                                        />
                                    ))}

                                    {aiTyping && (
                                        <ListItem>
                                            <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>AI</Avatar>
                                            <TypingIndicator />
                                        </ListItem>
                                    )}

                                    <div ref={messagesEndRef} />
                                </List>
                            )}
                        </Box>

                        {/* Message Input */}
                        <Paper
                            elevation={3}
                            sx={{
                                p: 2,
                                borderRadius: 0,
                                borderTop: 1,
                                borderColor: 'divider'
                            }}
                        >
                            <Box
                                component="form"
                                onSubmit={handleSendMessage}
                                sx={{ display: 'flex', gap: 1 }}
                            >
                                <TextField
                                    ref={inputRef}
                                    fullWidth
                                    multiline
                                    maxRows={4}
                                    value={messageText}
                                    onChange={handleInputChange}
                                    placeholder="Type your message..."
                                    variant="outlined"
                                    size="small"
                                    disabled={!isConnected}
                                />
                                <IconButton
                                    type="submit"
                                    disabled={!messageText.trim() || !isConnected}
                                    color="primary"
                                    size="large"
                                >
                                    <Send />
                                </IconButton>
                            </Box>
                        </Paper>
                    </>
                ) : (
                    // Welcome Screen
                    <Box
                        sx={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            p: 4,
                            textAlign: 'center'
                        }}
                    >
                        <Typography variant="h4" gutterBottom>
                            Welcome to Gemini Chatbot
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            Start a conversation with our intelligent AI assistant.
                            Create a new chat or select an existing conversation from the sidebar.
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<Add />}
                            onClick={() => setShowNewChatDialog(true)}
                            sx={{ mt: 2 }}
                        >
                            Start New Conversation
                        </Button>
                    </Box>
                )}
            </Box>

            {/* New Chat Dialog */}
            <Dialog open={showNewChatDialog} onClose={() => setShowNewChatDialog(false)}>
                <DialogTitle>Create New Conversation</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Conversation Title"
                        value={newChatTitle}
                        onChange={(e) => setNewChatTitle(e.target.value)}
                        placeholder="Enter a title for your conversation"
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowNewChatDialog(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreateConversation} variant="contained">
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default ChatPage;