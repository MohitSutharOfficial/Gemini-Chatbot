const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const joi = require('joi');

// Rate limiting configurations
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests') => {
    return rateLimit({
        windowMs,
        max,
        message: { error: message },
        standardHeaders: true,
        legacyHeaders: false,
        skip: (req) => {
            // Skip rate limiting for health check endpoints
            return req.path === '/api/health';
        }
    });
};

// Different rate limits for different endpoints
const authRateLimit = createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    5, // 5 attempts per window
    'Too many authentication attempts. Please try again later.'
);

const messageRateLimit = createRateLimiter(
    60 * 1000, // 1 minute
    10, // 10 messages per minute
    'Too many messages. Please slow down.'
);

const generalRateLimit = createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    100, // 100 requests per window
    'Too many requests from this IP. Please try again later.'
);

// Validation middleware
const validateRequest = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        next();
    };
};

// Joi schema validation
const validateSchema = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message
                }))
            });
        }
        req.body = value;
        next();
    };
};

// Common validation schemas
const schemas = {
    register: joi.object({
        username: joi.string().alphanum().min(3).max(30).required(),
        email: joi.string().email().required(),
        password: joi.string().min(6).max(100).required(),
        firstName: joi.string().min(1).max(50).optional(),
        lastName: joi.string().min(1).max(50).optional()
    }),

    login: joi.object({
        email: joi.string().email().required(),
        password: joi.string().min(6).required()
    }),

    message: joi.object({
        content: joi.string().min(1).max(10000).required(),
        type: joi.string().valid('text', 'image', 'file').default('text'),
        parentId: joi.string().uuid().optional()
    }),

    conversation: joi.object({
        title: joi.string().min(1).max(100).optional(),
        settings: joi.object({
            personality: joi.string().valid('helpful', 'creative', 'professional', 'casual').default('helpful'),
            temperature: joi.number().min(0).max(1).default(0.7),
            maxTokens: joi.number().min(100).max(2048).default(1024)
        }).optional()
    }),

    updateUser: joi.object({
        firstName: joi.string().min(1).max(50).optional(),
        lastName: joi.string().min(1).max(50).optional(),
        preferences: joi.object({
            theme: joi.string().valid('light', 'dark').optional(),
            language: joi.string().min(2).max(10).optional(),
            notifications: joi.boolean().optional(),
            soundEnabled: joi.boolean().optional()
        }).optional()
    })
};

// Input sanitization
const sanitizeInput = (req, res, next) => {
    const sanitizeString = (str) => {
        if (typeof str !== 'string') return str;
        return str.trim().replace(/[<>]/g, '');
    };

    const sanitizeObject = (obj) => {
        const sanitized = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (typeof obj[key] === 'string') {
                    sanitized[key] = sanitizeString(obj[key]);
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    sanitized[key] = sanitizeObject(obj[key]);
                } else {
                    sanitized[key] = obj[key];
                }
            }
        }
        return sanitized;
    };

    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body);
    }

    next();
};

module.exports = {
    authRateLimit,
    messageRateLimit,
    generalRateLimit,
    validateRequest,
    validateSchema,
    schemas,
    sanitizeInput
};