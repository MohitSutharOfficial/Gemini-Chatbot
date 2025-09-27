const express = require('express');
const router = express.Router();
const geminiService = require('../services/geminiService');

// Simple chat endpoint without authentication
router.post('/chat', async (req, res) => {
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
});

// Health check endpoint
router.get('/health', (req, res) => {
    const health = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        geminiApi: process.env.GEMINI_API_KEY ? 'Configured' : 'Not configured'
    };

    if (!process.env.GEMINI_API_KEY) {
        health.status = 'WARNING';
    }

    const statusCode = health.status === 'WARNING' ? 200 : 200;
    res.status(statusCode).json(health);
});

// API info endpoint
router.get('/info', (req, res) => {
    res.json({
        name: 'Gemini Chatbot API',
        version: '1.0.0',
        description: 'Simple Gemini AI chatbot API',
        endpoints: {
            chat: '/api/chat',
            health: '/api/health'
        }
    });
});

module.exports = router;