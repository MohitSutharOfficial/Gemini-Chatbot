const express = require('express');
const router = express.Router();
const joi = require('joi');
const messageController = require('../controllers/messageController');
const { authenticateToken } = require('../middleware/auth');
const { messageRateLimit, validateSchema, schemas, sanitizeInput } = require('../middleware/validation');

// All routes require authentication
router.use(authenticateToken);

// GET /api/conversations/:conversationId/messages - Get messages
router.get('/:conversationId/messages', messageController.getMessages);

// POST /api/conversations/:conversationId/messages - Send message
router.post('/:conversationId/messages',
    messageRateLimit,
    sanitizeInput,
    validateSchema(schemas.message),
    messageController.sendMessage
);

// GET /api/conversations/:conversationId/messages/search - Search messages
router.get('/:conversationId/messages/search', messageController.searchMessages);

// PUT /api/messages/:messageId - Update message
router.put('/messages/:messageId',
    sanitizeInput,
    validateSchema(joi.object({
        content: joi.string().min(1).max(10000).required()
    })),
    messageController.updateMessage
);

// DELETE /api/messages/:messageId - Delete message
router.delete('/messages/:messageId', messageController.deleteMessage);

// POST /api/messages/:messageId/regenerate - Regenerate AI response
router.post('/messages/:messageId/regenerate', messageController.regenerateResponse);

module.exports = router;