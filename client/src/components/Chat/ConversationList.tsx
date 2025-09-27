import React from 'react';
import {
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Typography,
    Chip,
    CircularProgress,
} from '@mui/material';

interface Conversation {
    id: string;
    title: string;
    lastMessage?: string;
    timestamp: Date;
    unreadCount?: number;
}

interface ConversationListProps {
    currentConversationId?: string;
    onConversationSelect?: (conversationId: string) => void;
    isLoading?: boolean;
}

const ConversationList: React.FC<ConversationListProps> = ({
    currentConversationId,
    onConversationSelect,
    isLoading = false,
}) => {
    const [conversations] = React.useState<Conversation[]>([
        {
            id: '1',
            title: 'General Chat',
            lastMessage: 'Hello! How can I help you today?',
            timestamp: new Date(),
            unreadCount: 0,
        },
    ]);

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                <CircularProgress size={24} />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h6" sx={{ p: 2, fontWeight: 600 }}>
                Conversations
            </Typography>
            <List disablePadding>
                {conversations.map((conversation) => (
                    <ListItem key={conversation.id} disablePadding>
                        <ListItemButton
                            selected={currentConversationId === conversation.id}
                            onClick={() => onConversationSelect?.(conversation.id)}
                            sx={{
                                py: 1.5,
                                px: 2,
                                borderRadius: 1,
                                mx: 1,
                                '&.Mui-selected': {
                                    backgroundColor: 'primary.main',
                                    color: 'primary.contrastText',
                                    '&:hover': {
                                        backgroundColor: 'primary.dark',
                                    },
                                },
                            }}
                        >
                            <ListItemText
                                primary={
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Typography variant="subtitle2" noWrap>
                                            {conversation.title}
                                        </Typography>
                                        {conversation.unreadCount && conversation.unreadCount > 0 && (
                                            <Chip
                                                size="small"
                                                label={conversation.unreadCount}
                                                color="secondary"
                                                sx={{ minWidth: 24, height: 20 }}
                                            />
                                        )}
                                    </Box>
                                }
                                secondary={
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        noWrap
                                        sx={{ mt: 0.5 }}
                                    >
                                        {conversation.lastMessage || 'No messages yet'}
                                    </Typography>
                                }
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default ConversationList;