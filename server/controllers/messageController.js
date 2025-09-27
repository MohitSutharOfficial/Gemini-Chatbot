const { Message, Conversation, User } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');
const geminiService = require('../config/gemini');
const { Op } = require('sequelize');

const getMessages = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;
    const { page = 1, limit = 50, since } = req.query;
    const offset = (page - 1) * limit;

    // Verify conversation belongs to user
    const conversation = await Conversation.findOne({
        where: {
            id: conversationId,
            userId: req.user.id,
            isActive: true
        }
    });

    if (!conversation) {
        return res.status(404).json({
            error: 'Conversation not found'
        });
    }

    const whereClause = { conversationId };
    if (since) {
        whereClause.createdAt = { [Op.gt]: new Date(since) };
    }

    const { count, rows: messages } = await Message.findAndCountAll({
        where: whereClause,
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['username', 'firstName', 'lastName', 'avatar']
            }
        ],
        order: [['createdAt', 'ASC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
    });

    res.json({
        messages,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalCount: count,
            hasMore: offset + messages.length < count
        }
    });
});

const sendMessage = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;
    const { content, type = 'text', parentId } = req.body;

    // Verify conversation belongs to user
    const conversation = await Conversation.findOne({
        where: {
            id: conversationId,
            userId: req.user.id,
            isActive: true
        }
    });

    if (!conversation) {
        return res.status(404).json({
            error: 'Conversation not found'
        });
    }

    // Create user message
    const userMessage = await Message.create({
        conversationId,
        userId: req.user.id,
        content,
        role: 'user',
        type,
        parentId
    });

    // Update conversation
    await conversation.updateLastMessage();

    // Get conversation history for context
    const recentMessages = await Message.findAll({
        where: { conversationId },
        order: [['createdAt', 'DESC']],
        limit: 10,
        attributes: ['content', 'role']
    });

    const conversationHistory = recentMessages
        .reverse()
        .slice(0, -1) // Remove the current message
        .map(msg => ({
            role: msg.role,
            content: msg.content
        }));

    try {
        // Generate AI response
        const aiResponse = await geminiService.generateResponse(content, conversationHistory);

        if (aiResponse.success) {
            // Create AI message
            const aiMessage = await Message.create({
                conversationId,
                userId: null, // AI messages don't have a user
                content: aiResponse.content,
                role: 'assistant',
                type: 'text',
                parentId: userMessage.id,
                metadata: {
                    finishReason: aiResponse.finishReason,
                    model: 'gemini-pro'
                }
            });

            // Update conversation again
            await conversation.updateLastMessage();

            res.json({
                userMessage,
                aiMessage,
                conversation: {
                    id: conversation.id,
                    lastMessageAt: conversation.lastMessageAt,
                    messageCount: conversation.messageCount
                }
            });
        } else {
            // Handle safety filter or other API issues
            const errorMessage = await Message.create({
                conversationId,
                userId: null,
                content: aiResponse.error || 'I apologize, but I cannot generate a response to that message.',
                role: 'assistant',
                type: 'system',
                parentId: userMessage.id,
                metadata: {
                    error: true,
                    errorType: aiResponse.type || 'UNKNOWN'
                }
            });

            res.json({
                userMessage,
                aiMessage: errorMessage,
                conversation: {
                    id: conversation.id,
                    lastMessageAt: conversation.lastMessageAt,
                    messageCount: conversation.messageCount
                }
            });
        }
    } catch (error) {
        console.error('Error generating AI response:', error);

        // Create error message
        const errorMessage = await Message.create({
            conversationId,
            userId: null,
            content: 'I apologize, but I encountered an error while processing your message. Please try again.',
            role: 'assistant',
            type: 'system',
            parentId: userMessage.id,
            metadata: {
                error: true,
                errorMessage: error.message
            }
        });

        res.json({
            userMessage,
            aiMessage: errorMessage,
            conversation: {
                id: conversation.id,
                lastMessageAt: conversation.lastMessageAt,
                messageCount: conversation.messageCount
            }
        });
    }
});

const updateMessage = asyncHandler(async (req, res) => {
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await Message.findOne({
        where: { id: messageId },
        include: [
            {
                model: Conversation,
                as: 'conversation',
                where: { userId: req.user.id, isActive: true }
            }
        ]
    });

    if (!message) {
        return res.status(404).json({
            error: 'Message not found'
        });
    }

    // Only allow users to edit their own messages
    if (message.userId !== req.user.id) {
        return res.status(403).json({
            error: 'You can only edit your own messages'
        });
    }

    message.content = content;
    await message.markAsEdited();

    res.json({
        message: 'Message updated successfully',
        message: message
    });
});

const deleteMessage = asyncHandler(async (req, res) => {
    const { messageId } = req.params;

    const message = await Message.findOne({
        where: { id: messageId },
        include: [
            {
                model: Conversation,
                as: 'conversation',
                where: { userId: req.user.id, isActive: true }
            }
        ]
    });

    if (!message) {
        return res.status(404).json({
            error: 'Message not found'
        });
    }

    // Only allow users to delete their own messages or conversation owners
    if (message.userId !== req.user.id && message.conversation.userId !== req.user.id) {
        return res.status(403).json({
            error: 'Permission denied'
        });
    }

    await message.destroy();

    // Update conversation message count
    await message.conversation.updateLastMessage();

    res.json({
        message: 'Message deleted successfully'
    });
});

const searchMessages = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;
    const { query, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    if (!query || query.trim().length < 2) {
        return res.status(400).json({
            error: 'Search query must be at least 2 characters long'
        });
    }

    // Verify conversation belongs to user
    const conversation = await Conversation.findOne({
        where: {
            id: conversationId,
            userId: req.user.id,
            isActive: true
        }
    });

    if (!conversation) {
        return res.status(404).json({
            error: 'Conversation not found'
        });
    }

    const { count, rows: messages } = await Message.findAndCountAll({
        where: {
            conversationId,
            content: {
                [Op.like]: `%${query}%`
            }
        },
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['username', 'firstName', 'lastName', 'avatar']
            }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
    });

    res.json({
        messages,
        query,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalCount: count,
            hasMore: offset + messages.length < count
        }
    });
});

const regenerateResponse = asyncHandler(async (req, res) => {
    const { messageId } = req.params;

    // Find the AI message to regenerate
    const aiMessage = await Message.findOne({
        where: {
            id: messageId,
            role: 'assistant'
        },
        include: [
            {
                model: Conversation,
                as: 'conversation',
                where: { userId: req.user.id, isActive: true }
            },
            {
                model: Message,
                as: 'parent',
                attributes: ['content', 'role']
            }
        ]
    });

    if (!aiMessage || !aiMessage.parent) {
        return res.status(404).json({
            error: 'Message not found or cannot be regenerated'
        });
    }

    const conversation = aiMessage.conversation;
    const userPrompt = aiMessage.parent.content;

    // Get conversation history up to this point
    const historyMessages = await Message.findAll({
        where: {
            conversationId: conversation.id,
            createdAt: { [Op.lt]: aiMessage.createdAt }
        },
        order: [['createdAt', 'ASC']],
        limit: 10,
        attributes: ['content', 'role']
    });

    const conversationHistory = historyMessages.map(msg => ({
        role: msg.role,
        content: msg.content
    }));

    try {
        // Generate new response
        const aiResponse = await geminiService.generateResponse(userPrompt, conversationHistory);

        if (aiResponse.success) {
            // Update the existing message
            aiMessage.content = aiResponse.content;
            aiMessage.metadata = {
                ...aiMessage.metadata,
                regenerated: true,
                regeneratedAt: new Date(),
                finishReason: aiResponse.finishReason
            };
            await aiMessage.save();

            res.json({
                message: 'Response regenerated successfully',
                aiMessage
            });
        } else {
            res.status(400).json({
                error: aiResponse.error || 'Failed to regenerate response'
            });
        }
    } catch (error) {
        console.error('Error regenerating response:', error);
        res.status(500).json({
            error: 'Failed to regenerate response. Please try again.'
        });
    }
});

module.exports = {
    getMessages,
    sendMessage,
    updateMessage,
    deleteMessage,
    searchMessages,
    regenerateResponse
};