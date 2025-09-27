import React from 'react';
import { Box, Paper, Typography, Avatar, Chip } from '@mui/material';
import { Person, SmartToy } from '@mui/icons-material';
import { Message } from '../../contexts/SocketContext';

interface MessageComponentProps {
    message: Message;
    isLast?: boolean;
}

const MessageComponent: React.FC<MessageComponentProps> = ({ message, isLast }) => {
    const isAI = message.role === 'assistant';
    const isUser = message.role === 'user';

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: isUser ? 'row-reverse' : 'row',
                alignItems: 'flex-start',
                gap: 1,
                mb: 2,
                px: 2,
            }}
        >
            <Avatar
                sx={{
                    bgcolor: isAI ? 'primary.main' : 'secondary.main',
                    width: 40,
                    height: 40,
                }}
            >
                {isAI ? <SmartToy /> : <Person />}
            </Avatar>

            <Paper
                sx={{
                    maxWidth: '70%',
                    p: 2,
                    bgcolor: isUser ? 'primary.main' : 'background.paper',
                    color: isUser ? 'primary.contrastText' : 'text.primary',
                    borderRadius: 2,
                }}
                elevation={1}
            >
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {message.content}
                </Typography>

                {message.status === 'sending' && (
                    <Chip
                        label="Sending..."
                        size="small"
                        sx={{ mt: 1, opacity: 0.7 }}
                    />
                )}

                {message.status === 'error' && (
                    <Chip
                        label="Failed to send"
                        size="small"
                        color="error"
                        sx={{ mt: 1 }}
                    />
                )}

                <Typography
                    variant="caption"
                    sx={{
                        display: 'block',
                        mt: 1,
                        opacity: 0.7,
                        fontSize: '0.75rem',
                    }}
                >
                    {new Date(message.createdAt).toLocaleTimeString()}
                </Typography>
            </Paper>
        </Box>
    );
};

export default MessageComponent;