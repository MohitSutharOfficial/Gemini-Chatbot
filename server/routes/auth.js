const express = require('express');
const router = express.Router();
const joi = require('joi');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { authRateLimit, validateSchema, schemas, sanitizeInput } = require('../middleware/validation');

// Public routes
router.post('/register',
    authRateLimit,
    sanitizeInput,
    validateSchema(schemas.register),
    authController.register
);

router.post('/login',
    authRateLimit,
    sanitizeInput,
    validateSchema(schemas.login),
    authController.login
);

// Protected routes
router.use(authenticateToken);

router.post('/logout', authController.logout);
router.get('/me', authController.getCurrentUser);

router.put('/profile',
    sanitizeInput,
    validateSchema(schemas.updateUser),
    authController.updateProfile
);

router.put('/password',
    sanitizeInput,
    validateSchema(joi.object({
        currentPassword: joi.string().min(6).required(),
        newPassword: joi.string().min(6).max(100).required()
    })),
    authController.changePassword
);

router.delete('/account', authController.deactivateAccount);

module.exports = router;