const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Conversation = sequelize.define('Conversation', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'New Conversation',
        validate: {
            len: [1, 100]
        }
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    settings: {
        type: DataTypes.JSON,
        defaultValue: {
            personality: 'helpful',
            temperature: 0.7,
            maxTokens: 1024
        }
    },
    lastMessageAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    messageCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    tags: {
        type: DataTypes.JSON,
        defaultValue: []
    }
}, {
    indexes: [
        { fields: ['user_id'] },
        { fields: ['last_message_at'] },
        { fields: ['created_at'] },
        { fields: ['user_id', 'is_active'] }
    ]
});

// Instance methods
Conversation.prototype.updateLastMessage = async function () {
    this.lastMessageAt = new Date();
    this.messageCount = await this.countMessages();
    await this.save();
};

module.exports = Conversation;