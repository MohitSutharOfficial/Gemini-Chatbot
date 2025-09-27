const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

const register = asyncHandler(async (req, res) => {
    const { username, email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
        where: {
            $or: [{ email }, { username }]
        }
    });

    if (existingUser) {
        const field = existingUser.email === email ? 'email' : 'username';
        return res.status(409).json({
            error: `User with this ${field} already exists`
        });
    }

    // Create new user
    const user = await User.create({
        username,
        email,
        password,
        firstName,
        lastName
    });

    const token = generateToken(user.id);

    res.status(201).json({
        message: 'User registered successfully',
        token,
        user: user.toSafeObject()
    });
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
        return res.status(401).json({
            error: 'Invalid credentials'
        });
    }

    if (!user.isActive) {
        return res.status(401).json({
            error: 'Account is deactivated'
        });
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);

    if (!isValidPassword) {
        return res.status(401).json({
            error: 'Invalid credentials'
        });
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    const token = generateToken(user.id);

    res.json({
        message: 'Login successful',
        token,
        user: user.toSafeObject()
    });
});

const logout = asyncHandler(async (req, res) => {
    // In a more sophisticated setup, you might maintain a blacklist of tokens
    // For now, we just rely on the client to discard the token

    res.json({
        message: 'Logout successful'
    });
});

const getCurrentUser = asyncHandler(async (req, res) => {
    res.json({
        user: req.user.toSafeObject()
    });
});

const updateProfile = asyncHandler(async (req, res) => {
    const { firstName, lastName, preferences } = req.body;
    const user = req.user;

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (preferences !== undefined) {
        user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    res.json({
        message: 'Profile updated successfully',
        user: user.toSafeObject()
    });
});

const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    // Validate current password
    const isValidPassword = await user.validatePassword(currentPassword);

    if (!isValidPassword) {
        return res.status(400).json({
            error: 'Current password is incorrect'
        });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
        message: 'Password changed successfully'
    });
});

const deactivateAccount = asyncHandler(async (req, res) => {
    const user = req.user;

    user.isActive = false;
    await user.save();

    res.json({
        message: 'Account deactivated successfully'
    });
});

module.exports = {
    register,
    login,
    logout,
    getCurrentUser,
    updateProfile,
    changePassword,
    deactivateAccount
};