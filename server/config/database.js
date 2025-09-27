const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL || 'sqlite:./database.sqlite', {
    dialect: process.env.DATABASE_URL?.startsWith('postgresql') ? 'postgres' : 'sqlite',
    storage: process.env.DATABASE_URL?.startsWith('sqlite') ? './database.sqlite' : undefined,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
        timestamps: true,
        underscored: true,
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        process.exit(1);
    }
};

module.exports = { sequelize, testConnection };