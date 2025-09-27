import React from 'react';
import ChatPage from './components/Chat/ChatPage';
import { Box, AppBar, Toolbar, Typography } from '@mui/material';

function App() {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Gemini AI Chatbot
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box sx={{ flex: 1, p: 2 }}>
                <ChatPage />
            </Box>
        </Box>
    );
}

export default App;