const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

// Import configurations and middleware
const { sequelize, testConnection } = require('./config/database');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { generalRateLimit } = require('./middleware/validation');

// Import routes
const authRoutes = require('./routes/auth');
const conversationRoutes = require('./routes/conversations');
const messageRoutes = require('./routes/messages');
const indexRoutes = require('./routes/index');

// Import services
const SocketService = require('./services/socketService');

// Import models for initialization
const models = require('./models');

const app = express();
const server = http.createServer(app);

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", "ws:", "wss:"],
            imgSrc: ["'self'", "data:", "https:"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"]
        }
    },
    crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200
}));

// Compression
app.use(compression());

// Rate limiting
app.use('/api', generalRateLimit);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    }
    next();
});

// Health check (before rate limiting)
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// API routes
app.use('/api', indexRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api', messageRoutes); // Messages are under conversations

// Static file serving for uploads (if needed)
app.use('/uploads', express.static('./uploads'));

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
    try {
        // Test database connection
        await testConnection();

        // Sync database models
        console.log('Syncing database models...');
        await sequelize.sync({
            force: false, // Set to true only in development to reset DB
            alter: process.env.NODE_ENV === 'development' // Auto-alter tables in development
        });
        console.log('✅ Database models synchronized');

        // Initialize Socket.IO service
        const socketService = new SocketService(server);
        console.log('✅ Socket.IO service initialized');

        // Start server
        const PORT = process.env.PORT || 5000;
        server.listen(PORT, () => {
            console.log(`
🚀 Gemini Chatbot Server is running!
   
   Port: ${PORT}
   Environment: ${process.env.NODE_ENV || 'development'}
   Database: ${process.env.DATABASE_URL ? 'Connected' : 'SQLite (local)'}
   Gemini API: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Not configured'}
   
   API Base URL: http://localhost:${PORT}/api
   Health Check: http://localhost:${PORT}/api/health
   WebSocket: ws://localhost:${PORT}/socket.io
   
${process.env.NODE_ENV === 'development' ? '   📝 Development mode - Auto-sync enabled' : ''}
${!process.env.GEMINI_API_KEY ? '   ⚠️  Warning: GEMINI_API_KEY not set!' : ''}
      `);
        });

        // Graceful shutdown
        const gracefulShutdown = (signal) => {
            console.log(`\n📡 Received ${signal}. Starting graceful shutdown...`);

            server.close(async () => {
                console.log('🔌 HTTP server closed');

                try {
                    await sequelize.close();
                    console.log('🗄️  Database connection closed');
                    console.log('✅ Graceful shutdown completed');
                    process.exit(0);
                } catch (error) {
                    console.error('❌ Error during shutdown:', error);
                    process.exit(1);
                }
            });
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

// Start the server
startServer();