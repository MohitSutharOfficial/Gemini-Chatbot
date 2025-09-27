const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { sequelize } = require('../config/database');
const geminiService = require('../services/geminiService');

// Simple chat endpoint without authentication
router.post('/chat', asyncHandler(async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const response = await geminiService.generateResponse(message);
        res.json({ response });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            error: 'Failed to generate response',
            response: 'Sorry, I encountered an error. Please try again.'
        });
    }
}));

// Health check endpoint
router.get('/health', asyncHandler(async (req, res) => {
    const health = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
    };

    // Check database connection
    try {
        await sequelize.authenticate();
        health.database = 'Connected';
    } catch (error) {
        health.database = 'Disconnected';
        health.status = 'ERROR';
    }

    // Check Gemini API key
    health.geminiApi = process.env.GEMINI_API_KEY ? 'Configured' : 'Not configured';
    if (!process.env.GEMINI_API_KEY) {
        health.status = 'WARNING';
    }

    const statusCode = health.status === 'ERROR' ? 503 : 200;
    res.status(statusCode).json(health);
}));

// API info endpoint
router.get('/info', (req, res) => {
    res.json({
        name: 'Gemini Chatbot API',
        version: process.env.npm_package_version || '1.0.0',
        description: 'Backend API for Gemini AI chatbot application',
        endpoints: {
            auth: '/api/auth',
            conversations: '/api/conversations',
            messages: '/api/conversations/:id/messages',
            health: '/api/health',
            websocket: '/socket.io'
        },
        documentation: 'https://github.com/your-repo/gemini-chatbot'
    });
});

module.exports = router;