const User = require('./User');
const Conversation = require('./Conversation');
const Message = require('./Message');

// Define associations
User.hasMany(Conversation, {
    foreignKey: 'userId',
    as: 'conversations',
    onDelete: 'CASCADE'
});

Conversation.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

Conversation.hasMany(Message, {
    foreignKey: 'conversationId',
    as: 'messages',
    onDelete: 'CASCADE'
});

Message.belongsTo(Conversation, {
    foreignKey: 'conversationId',
    as: 'conversation'
});

Message.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

User.hasMany(Message, {
    foreignKey: 'userId',
    as: 'messages',
    onDelete: 'SET NULL'
});

// Self-referencing association for message replies
Message.hasMany(Message, {
    foreignKey: 'parentId',
    as: 'replies',
    onDelete: 'SET NULL'
});

Message.belongsTo(Message, {
    foreignKey: 'parentId',
    as: 'parent'
});

module.exports = {
    User,
    Conversation,
    Message
};