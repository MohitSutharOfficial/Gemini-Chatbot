const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    conversationId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'conversations',
            key: 'id'
        }
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true, // null for bot messages
        references: {
            model: 'users',
            key: 'id'
        }
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            len: [1, 10000]
        }
    },
    role: {
        type: DataTypes.ENUM('user', 'assistant'),
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('text', 'image', 'file', 'system'),
        defaultValue: 'text'
    },
    metadata: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    status: {
        type: DataTypes.ENUM('sending', 'sent', 'delivered', 'error'),
        defaultValue: 'sent'
    },
    isEdited: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    editedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    parentId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'messages',
            key: 'id'
        }
    },
    attachments: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    tokenCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    indexes: [
        { fields: ['conversation_id'] },
        { fields: ['created_at'] },
        { fields: ['role'] },
        { fields: ['conversation_id', 'created_at'] },
        { fields: ['parent_id'] }
    ]
});

// Instance methods
Message.prototype.markAsEdited = async function () {
    this.isEdited = true;
    this.editedAt = new Date();
    await this.save();
};

module.exports = Message;