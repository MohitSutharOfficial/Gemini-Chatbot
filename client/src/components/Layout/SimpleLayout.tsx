import React from 'react';
import { Box, CssBaseline, AppBar, Toolbar, Typography } from '@mui/material';

interface SimpleLayoutProps {
    children: React.ReactNode;
}

const SimpleLayout: React.FC<SimpleLayoutProps> = ({ children }) => {
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
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default SimpleLayout;
