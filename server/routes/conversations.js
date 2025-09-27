const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');
const { authenticateToken } = require('../middleware/auth');
const { validateSchema, schemas, sanitizeInput } = require('../middleware/validation');

// All routes require authentication
router.use(authenticateToken);

// GET /api/conversations - Get user's conversations
router.get('/', conversationController.getConversations);

// POST /api/conversations - Create new conversation
router.post('/',
    sanitizeInput,
    validateSchema(schemas.conversation),
    conversationController.createConversation
);

// GET /api/conversations/stats - Get conversation statistics
router.get('/stats', conversationController.getConversationStats);

// GET /api/conversations/:id - Get specific conversation
router.get('/:id', conversationController.getConversation);

// PUT /api/conversations/:id - Update conversation
router.put('/:id',
    sanitizeInput,
    validateSchema(schemas.conversation),
    conversationController.updateConversation
);

// DELETE /api/conversations/:id - Delete conversation
router.delete('/:id', conversationController.deleteConversation);

// GET /api/conversations/:id/export - Export conversation
router.get('/:id/export', conversationController.exportConversation);

module.exports = router;