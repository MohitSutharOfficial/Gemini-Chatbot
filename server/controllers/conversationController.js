const { Conversation, Message, User } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');
const { Op, sequelize } = require('sequelize');

const getConversations = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
        userId: req.user.id,
        isActive: true
    };

    if (search) {
        whereClause.title = {
            [Op.like]: `%${search}%`
        };
    }

    const { count, rows: conversations } = await Conversation.findAndCountAll({
        where: whereClause,
        include: [
            {
                model: Message,
                as: 'messages',
                limit: 1,
                order: [['createdAt', 'DESC']],
                attributes: ['content', 'createdAt', 'role']
            }
        ],
        order: [['lastMessageAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
    });

    res.json({
        conversations,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(count / limit),
            totalCount: count,
            hasMore: offset + conversations.length < count
        }
    });
});

const getConversation = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { includeMessages = true, messageLimit = 50, messageOffset = 0 } = req.query;

    const conversation = await Conversation.findOne({
        where: {
            id,
            userId: req.user.id,
            isActive: true
        },
        include: includeMessages === 'true' ? [
            {
                model: Message,
                as: 'messages',
                order: [['createdAt', 'ASC']],
                limit: parseInt(messageLimit),
                offset: parseInt(messageOffset),
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['username', 'firstName', 'lastName', 'avatar']
                    }
                ]
            }
        ] : []
    });

    if (!conversation) {
        return res.status(404).json({
            error: 'Conversation not found'
        });
    }

    res.json({ conversation });
});

const createConversation = asyncHandler(async (req, res) => {
    const { title, settings } = req.body;

    const conversation = await Conversation.create({
        title: title || 'New Conversation',
        userId: req.user.id,
        settings: settings || {}
    });

    res.status(201).json({
        message: 'Conversation created successfully',
        conversation
    });
});

const updateConversation = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, settings, tags } = req.body;

    const conversation = await Conversation.findOne({
        where: {
            id,
            userId: req.user.id,
            isActive: true
        }
    });

    if (!conversation) {
        return res.status(404).json({
            error: 'Conversation not found'
        });
    }

    if (title !== undefined) conversation.title = title;
    if (settings !== undefined) conversation.settings = { ...conversation.settings, ...settings };
    if (tags !== undefined) conversation.tags = tags;

    await conversation.save();

    res.json({
        message: 'Conversation updated successfully',
        conversation
    });
});

const deleteConversation = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const conversation = await Conversation.findOne({
        where: {
            id,
            userId: req.user.id,
            isActive: true
        }
    });

    if (!conversation) {
        return res.status(404).json({
            error: 'Conversation not found'
        });
    }

    // Soft delete
    conversation.isActive = false;
    await conversation.save();

    res.json({
        message: 'Conversation deleted successfully'
    });
});

const getConversationStats = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const stats = await Conversation.findOne({
        where: { userId, isActive: true },
        attributes: [
            [sequelize.fn('COUNT', sequelize.col('id')), 'totalConversations'],
            [sequelize.fn('SUM', sequelize.col('messageCount')), 'totalMessages'],
            [sequelize.fn('AVG', sequelize.col('messageCount')), 'avgMessagesPerConversation']
        ],
        raw: true
    });

    const recentActivity = await Conversation.findAll({
        where: { userId, isActive: true },
        order: [['lastMessageAt', 'DESC']],
        limit: 5,
        attributes: ['id', 'title', 'lastMessageAt', 'messageCount']
    });

    res.json({
        stats: {
            totalConversations: parseInt(stats.totalConversations) || 0,
            totalMessages: parseInt(stats.totalMessages) || 0,
            avgMessagesPerConversation: parseFloat(stats.avgMessagesPerConversation) || 0
        },
        recentActivity
    });
});

const exportConversation = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { format = 'json' } = req.query;

    const conversation = await Conversation.findOne({
        where: {
            id,
            userId: req.user.id,
            isActive: true
        },
        include: [
            {
                model: Message,
                as: 'messages',
                order: [['createdAt', 'ASC']],
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['username', 'firstName', 'lastName']
                    }
                ]
            }
        ]
    });

    if (!conversation) {
        return res.status(404).json({
            error: 'Conversation not found'
        });
    }

    if (format === 'txt') {
        let textContent = `Conversation: ${conversation.title}\n`;
        textContent += `Created: ${conversation.createdAt.toISOString()}\n`;
        textContent += `Messages: ${conversation.messages.length}\n\n`;
        textContent += '=' * 50 + '\n\n';

        conversation.messages.forEach(message => {
            const sender = message.role === 'user'
                ? (message.user ? `${message.user.firstName} ${message.user.lastName}`.trim() : 'User')
                : 'Assistant';

            textContent += `[${message.createdAt.toISOString()}] ${sender}:\n`;
            textContent += `${message.content}\n\n`;
        });

        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="${conversation.title.replace(/[^a-z0-9]/gi, '_')}.txt"`);
        return res.send(textContent);
    }

    // Default JSON format
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${conversation.title.replace(/[^a-z0-9]/gi, '_')}.json"`);
    res.json({
        conversation: {
            id: conversation.id,
            title: conversation.title,
            createdAt: conversation.createdAt,
            messageCount: conversation.messageCount,
            messages: conversation.messages.map(msg => ({
                id: msg.id,
                content: msg.content,
                role: msg.role,
                timestamp: msg.createdAt,
                sender: msg.user ? `${msg.user.firstName} ${msg.user.lastName}`.trim() : null
            }))
        },
        exportedAt: new Date().toISOString()
    });
});

module.exports = {
    getConversations,
    getConversation,
    createConversation,
    updateConversation,
    deleteConversation,
    getConversationStats,
    exportConversation
};