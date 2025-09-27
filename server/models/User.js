const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            len: [3, 30],
            isAlphanumeric: true
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [6, 100]
        }
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            len: [1, 50]
        }
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            len: [1, 50]
        }
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: true
    },
    preferences: {
        type: DataTypes.JSON,
        defaultValue: {
            theme: 'light',
            language: 'en',
            notifications: true,
            soundEnabled: true
        }
    },
    lastActive: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    hooks: {
        beforeSave: async (user) => {
            if (user.changed('password')) {
                const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
                user.password = await bcrypt.hash(user.password, saltRounds);
            }
        }
    },
    indexes: [
        { fields: ['email'] },
        { fields: ['username'] },
        { fields: ['last_active'] }
    ]
});

// Instance methods
User.prototype.validatePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

User.prototype.toSafeObject = function () {
    const { password, ...safeUser } = this.toJSON();
    return safeUser;
};

module.exports = User;