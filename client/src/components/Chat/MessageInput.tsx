import React, { useState, useRef, useCallback } from 'react';
import {
    Box,
    TextField,
    IconButton,
    Paper,
    Tooltip,
    CircularProgress,
} from '@mui/material';
import {
    Send as SendIcon,
    AttachFile as AttachFileIcon,
    EmojiEmotions as EmojiIcon,
} from '@mui/icons-material';

interface MessageInputProps {
    onSendMessage: (message: string) => void;
    onTyping?: (isTyping: boolean) => void;
    disabled?: boolean;
    isLoading?: boolean;
    placeholder?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
    onSendMessage,
    onTyping,
    disabled = false,
    isLoading = false,
    placeholder = "Type your message here...",
}) => {
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout>();
    const textFieldRef = useRef<HTMLInputElement>();

    const handleTyping = useCallback((value: string) => {
        if (!isTyping && value.length > 0) {
            setIsTyping(true);
            onTyping?.(true);
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing indicator
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            onTyping?.(false);
        }, 1500);
    }, [isTyping, onTyping]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setMessage(value);
        handleTyping(value);
    };

    const handleSendMessage = () => {
        if (message.trim() && !disabled && !isLoading) {
            onSendMessage(message.trim());
            setMessage('');
            setIsTyping(false);
            onTyping?.(false);

            // Clear typing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    const handleAttachFile = () => {
        // TODO: Implement file attachment
        console.log('File attachment clicked');
    };

    const handleEmojiClick = () => {
        // TODO: Implement emoji picker
        console.log('Emoji picker clicked');
    };

    React.useEffect(() => {
        // Cleanup timeout on unmount
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    return (
        <Paper
            elevation={2}
            sx={{
                p: 2,
                backgroundColor: 'background.paper',
                borderTop: 1,
                borderColor: 'divider',
            }}
        >
            <Box display="flex" alignItems="flex-end" gap={1}>
                <Tooltip title="Attach file">
                    <IconButton
                        size="small"
                        onClick={handleAttachFile}
                        disabled={disabled}
                        sx={{ mb: 1 }}
                    >
                        <AttachFileIcon />
                    </IconButton>
                </Tooltip>

                <TextField
                    inputRef={textFieldRef}
                    fullWidth
                    multiline
                    maxRows={4}
                    value={message}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder={placeholder}
                    disabled={disabled || isLoading}
                    variant="outlined"
                    size="small"
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            backgroundColor: 'background.default',
                            '&:hover fieldset': {
                                borderColor: 'primary.main',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: 'primary.main',
                            },
                        },
                    }}
                />

                <Tooltip title="Add emoji">
                    <IconButton
                        size="small"
                        onClick={handleEmojiClick}
                        disabled={disabled}
                        sx={{ mb: 1 }}
                    >
                        <EmojiIcon />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Send message">
                    <span>
                        <IconButton
                            color="primary"
                            onClick={handleSendMessage}
                            disabled={!message.trim() || disabled || isLoading}
                            sx={{
                                mb: 1,
                                backgroundColor: message.trim() ? 'primary.main' : 'action.disabled',
                                color: message.trim() ? 'primary.contrastText' : 'action.disabled',
                                '&:hover': {
                                    backgroundColor: message.trim() ? 'primary.dark' : 'action.disabled',
                                },
                                '&:disabled': {
                                    backgroundColor: 'action.disabled',
                                    color: 'action.disabled',
                                },
                            }}
                        >
                            {isLoading ? (
                                <CircularProgress size={20} color="inherit" />
                            ) : (
                                <SendIcon />
                            )}
                        </IconButton>
                    </span>
                </Tooltip>
            </Box>
        </Paper>
    );
};

export default MessageInput;