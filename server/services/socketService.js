const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const { User, Conversation, Message } = require('../models');
const geminiService = require('../config/gemini');

class SocketService {
    constructor(server) {
        this.io = socketIo(server, {
            cors: {
                origin: process.env.CORS_ORIGIN || "http://localhost:3000",
                methods: ["GET", "POST"],
                credentials: true
            }
        });

        this.connectedUsers = new Map(); // userId -> socketId mapping
        this.setupMiddleware();
        this.setupEventHandlers();
    }

    setupMiddleware() {
        // Authentication middleware for socket connections
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token || socket.handshake.query.token;

                if (!token) {
                    return next(new Error('Authentication error: No token provided'));
                }

                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findByPk(decoded.userId);

                if (!user || !user.isActive) {
                    return next(new Error('Authentication error: Invalid user'));
                }

                socket.userId = user.id;
                socket.user = user;
                next();
            } catch (error) {
                console.error('Socket authentication error:', error);
                next(new Error('Authentication error'));
            }
        });
    }

    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`User ${socket.userId} connected`);

            // Store user connection
            this.connectedUsers.set(socket.userId, socket.id);

            // Join user to their personal room
            socket.join(`user:${socket.userId}`);

            // Handle joining conversation rooms
            socket.on('join_conversation', async (conversationId) => {
                try {
                    // Verify user has access to this conversation
                    const conversation = await Conversation.findOne({
                        where: {
                            id: conversationId,
                            userId: socket.userId,
                            isActive: true
                        }
                    });

                    if (conversation) {
                        socket.join(`conversation:${conversationId}`);
                        socket.emit('joined_conversation', { conversationId });
                        console.log(`User ${socket.userId} joined conversation ${conversationId}`);
                    } else {
                        socket.emit('error', { message: 'Conversation not found or access denied' });
                    }
                } catch (error) {
                    console.error('Error joining conversation:', error);
                    socket.emit('error', { message: 'Failed to join conversation' });
                }
            });

            // Handle leaving conversation rooms
            socket.on('leave_conversation', (conversationId) => {
                socket.leave(`conversation:${conversationId}`);
                socket.emit('left_conversation', { conversationId });
                console.log(`User ${socket.userId} left conversation ${conversationId}`);
            });

            // Handle typing indicators
            socket.on('typing_start', (data) => {
                const { conversationId } = data;
                socket.to(`conversation:${conversationId}`).emit('user_typing', {
                    userId: socket.userId,
                    username: socket.user.username,
                    conversationId
                });
            });

            socket.on('typing_stop', (data) => {
                const { conversationId } = data;
                socket.to(`conversation:${conversationId}`).emit('user_stopped_typing', {
                    userId: socket.userId,
                    conversationId
                });
            });

            // Handle real-time messaging
            socket.on('send_message', async (data) => {
                try {
                    const { conversationId, content, type = 'text' } = data;

                    // Verify conversation access
                    const conversation = await Conversation.findOne({
                        where: {
                            id: conversationId,
                            userId: socket.userId,
                            isActive: true
                        }
                    });

                    if (!conversation) {
                        socket.emit('error', { message: 'Conversation not found' });
                        return;
                    }

                    // Create user message
                    const userMessage = await Message.create({
                        conversationId,
                        userId: socket.userId,
                        content,
                        role: 'user',
                        type,
                        status: 'sent'
                    });

                    // Broadcast user message to conversation room
                    this.io.to(`conversation:${conversationId}`).emit('new_message', {
                        message: userMessage,
                        user: socket.user.toSafeObject()
                    });

                    // Show typing indicator for AI
                    socket.to(`conversation:${conversationId}`).emit('ai_typing', {
                        conversationId
                    });

                    // Get conversation history and generate AI response
                    const recentMessages = await Message.findAll({
                        where: { conversationId },
                        order: [['createdAt', 'DESC']],
                        limit: 10,
                        attributes: ['content', 'role']
                    });

                    const conversationHistory = recentMessages
                        .reverse()
                        .slice(0, -1)
                        .map(msg => ({
                            role: msg.role,
                            content: msg.content
                        }));

                    // Generate streaming response
                    let aiMessageContent = '';
                    const aiMessage = await Message.create({
                        conversationId,
                        userId: null,
                        content: '', // Will be updated as we stream
                        role: 'assistant',
                        type: 'text',
                        parentId: userMessage.id,
                        status: 'sending'
                    });

                    // Emit AI message creation
                    this.io.to(`conversation:${conversationId}`).emit('ai_message_start', {
                        messageId: aiMessage.id,
                        conversationId
                    });

                    try {
                        await geminiService.generateStreamResponse(
                            content,
                            conversationHistory,
                            (chunk) => {
                                aiMessageContent += chunk;
                                // Emit streaming chunk
                                this.io.to(`conversation:${conversationId}`).emit('ai_message_chunk', {
                                    messageId: aiMessage.id,
                                    chunk,
                                    conversationId
                                });
                            }
                        );

                        // Update final message
                        aiMessage.content = aiMessageContent;
                        aiMessage.status = 'sent';
                        await aiMessage.save();

                        // Update conversation
                        await conversation.updateLastMessage();

                        // Emit completion
                        this.io.to(`conversation:${conversationId}`).emit('ai_message_complete', {
                            message: aiMessage,
                            conversationId
                        });

                        // Stop typing indicator
                        this.io.to(`conversation:${conversationId}`).emit('ai_stopped_typing', {
                            conversationId
                        });

                    } catch (error) {
                        console.error('Error generating AI response:', error);

                        // Update message with error
                        aiMessage.content = 'I apologize, but I encountered an error while processing your message.';
                        aiMessage.status = 'error';
                        await aiMessage.save();

                        this.io.to(`conversation:${conversationId}`).emit('ai_message_error', {
                            messageId: aiMessage.id,
                            error: 'Failed to generate response',
                            conversationId
                        });

                        this.io.to(`conversation:${conversationId}`).emit('ai_stopped_typing', {
                            conversationId
                        });
                    }

                } catch (error) {
                    console.error('Error handling message:', error);
                    socket.emit('error', { message: 'Failed to send message' });
                }
            });

            // Handle disconnection
            socket.on('disconnect', (reason) => {
                console.log(`User ${socket.userId} disconnected: ${reason}`);
                this.connectedUsers.delete(socket.userId);

                // Notify other users in conversations that this user is offline
                socket.broadcast.emit('user_offline', {
                    userId: socket.userId,
                    username: socket.user.username
                });
            });

            // Send connection confirmation
            socket.emit('connected', {
                message: 'Connected to chatbot server',
                userId: socket.userId,
                username: socket.user.username
            });

            // Notify other users that this user is online
            socket.broadcast.emit('user_online', {
                userId: socket.userId,
                username: socket.user.username
            });
        });
    }

    // Method to send notifications to specific users
    sendToUser(userId, event, data) {
        const socketId = this.connectedUsers.get(userId);
        if (socketId) {
            this.io.to(socketId).emit(event, data);
            return true;
        }
        return false;
    }

    // Method to send to all users in a conversation
    sendToConversation(conversationId, event, data) {
        this.io.to(`conversation:${conversationId}`).emit(event, data);
    }

    // Get online users count
    getOnlineUsersCount() {
        return this.connectedUsers.size;
    }

    // Get connected users
    getConnectedUsers() {
        return Array.from(this.connectedUsers.keys());
    }
}

module.exports = SocketService;