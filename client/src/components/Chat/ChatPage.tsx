import React, { useState } from 'react';
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    List,
    ListItem,
    ListItemText,
    Divider,
    CircularProgress
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

const ChatPage: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Hello! I\'m your Gemini AI assistant. How can I help you today?',
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const sendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputMessage,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            // Call the backend API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: inputMessage,
                    conversationId: 'default-conversation' // Simple default conversation
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: data.response || 'Sorry, I couldn\'t process your request.',
                sender: 'bot',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: 'Sorry, I encountered an error. Please try again.',
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Chat with Gemini AI
            </Typography>

            <Paper
                elevation={3}
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: 'calc(100vh - 200px)'
                }}
            >
                {/* Messages Area */}
                <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
                    <List>
                        {messages.map((message, index) => (
                            <React.Fragment key={message.id}>
                                <ListItem
                                    sx={{
                                        justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                                        px: 2
                                    }}
                                >
                                    <Paper
                                        elevation={1}
                                        sx={{
                                            p: 2,
                                            maxWidth: '70%',
                                            backgroundColor: message.sender === 'user' ? 'primary.main' : 'grey.100',
                                            color: message.sender === 'user' ? 'white' : 'text.primary'
                                        }}
                                    >
                                        <ListItemText
                                            primary={message.text}
                                            secondary={message.timestamp.toLocaleTimeString()}
                                            secondaryTypographyProps={{
                                                color: message.sender === 'user' ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                                                fontSize: '0.75rem'
                                            }}
                                        />
                                    </Paper>
                                </ListItem>
                                {index < messages.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                        {isLoading && (
                            <ListItem>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <CircularProgress size={20} />
                                    <Typography variant="body2" color="text.secondary">
                                        AI is thinking...
                                    </Typography>
                                </Box>
                            </ListItem>
                        )}
                    </List>
                </Box>

                {/* Input Area */}
                <Divider />
                <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
                    <TextField
                        fullWidth
                        multiline
                        maxRows={4}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        disabled={isLoading}
                        variant="outlined"
                        size="small"
                    />
                    <Button
                        variant="contained"
                        onClick={sendMessage}
                        disabled={!inputMessage.trim() || isLoading}
                        sx={{ minWidth: 'auto', px: 2 }}
                    >
                        <SendIcon />
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default ChatPage;