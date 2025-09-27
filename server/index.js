const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const indexRoutes = require('./routes/index');

const app = express();

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', indexRoutes);

// Error handling
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`
🚀 Gemini Chatbot Server Running!
   
   Port: ${PORT}
   Gemini API: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Not configured'}
   
   API: http://localhost:${PORT}/api/chat
   Health: http://localhost:${PORT}/api/health
${!process.env.GEMINI_API_KEY ? '   ⚠️  Warning: GEMINI_API_KEY not set!' : ''}
    `);
});