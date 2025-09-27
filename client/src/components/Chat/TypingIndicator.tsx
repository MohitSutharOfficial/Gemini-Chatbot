import React from 'react';
import { Box, Typography } from '@mui/material';

const TypingIndicator: React.FC = () => {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                AI is typing
            </Typography>
            <Box sx={{ ml: 1, display: 'flex', gap: 0.5 }}>
                <Box
                    sx={{
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        backgroundColor: 'primary.main',
                        animation: 'typing 1.5s infinite',
                        animationDelay: '0s'
                    }}
                />
                <Box
                    sx={{
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        backgroundColor: 'primary.main',
                        animation: 'typing 1.5s infinite',
                        animationDelay: '0.3s'
                    }}
                />
                <Box
                    sx={{
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        backgroundColor: 'primary.main',
                        animation: 'typing 1.5s infinite',
                        animationDelay: '0.6s'
                    }}
                />
            </Box>
        </Box>
    );
};

export default TypingIndicator;