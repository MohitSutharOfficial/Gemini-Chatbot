import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline, AppBar, Toolbar, Typography } from '@mui/material';

const SimpleLayout: React.FC = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <CssBaseline />
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Gemini Chatbot
                    </Typography>
                    <Typography variant="body2" sx={{ mr: 2 }}>
                        Ready to chat!
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box sx={{ flex: 1, display: 'flex' }}>
                <Box component="main" sx={{ flex: 1, p: 3 }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
};

export default SimpleLayout;
