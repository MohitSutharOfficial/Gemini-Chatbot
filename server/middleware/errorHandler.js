const errorHandler = (err, req, res, next) => {
    console.error('Error:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id
    });

    // Default error response
    let error = {
        message: 'Internal server error',
        status: 500
    };

    // Handle different error types
    if (err.name === 'ValidationError') {
        error = {
            message: 'Validation error',
            status: 400,
            details: err.errors
        };
    } else if (err.name === 'SequelizeValidationError') {
        error = {
            message: 'Database validation error',
            status: 400,
            details: err.errors.map(e => ({
                field: e.path,
                message: e.message
            }))
        };
    } else if (err.name === 'SequelizeUniqueConstraintError') {
        error = {
            message: 'Resource already exists',
            status: 409,
            details: err.errors.map(e => ({
                field: e.path,
                message: `${e.path} must be unique`
            }))
        };
    } else if (err.name === 'SequelizeForeignKeyConstraintError') {
        error = {
            message: 'Invalid reference',
            status: 400
        };
    } else if (err.name === 'JsonWebTokenError') {
        error = {
            message: 'Invalid token',
            status: 401
        };
    } else if (err.name === 'TokenExpiredError') {
        error = {
            message: 'Token expired',
            status: 401
        };
    } else if (err.status) {
        error = {
            message: err.message,
            status: err.status
        };
    }

    // Don't expose internal errors in production
    if (process.env.NODE_ENV === 'production' && error.status === 500) {
        error.message = 'Internal server error';
        delete error.details;
    }

    res.status(error.status).json({
        error: error.message,
        ...(error.details && { details: error.details }),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

const notFoundHandler = (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl,
        method: req.method
    });
};

const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = { errorHandler, notFoundHandler, asyncHandler };