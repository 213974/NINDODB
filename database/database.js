// database/database.js
const { Sequelize, DataTypes } = require('sequelize');
const path = require('node:path');

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'NINDO.db'), // Creates NINDO.db in root
    logging: false, // Set to console.log to see SQL queries
});

// Define the User model
const User = sequelize.define('User', {
    userId: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    globalName: {
        type: DataTypes.STRING,
        allowNull: true, // Can be null for older accounts
    },
    avatarURL: {
        type: DataTypes.STRING,
        allowNull: true,
    },
});

// Define the Clan model
const Clan = sequelize.define('Clan', {
    clanId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Clan names must be unique
    },
    motto: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    // The Discord Role ID associated with this clan, can be per-guild if needed
    roleId: {
        type: DataTypes.STRING,
        allowNull: true,
    }
});

// A user can own a clan
User.hasOne(Clan, { foreignKey: 'ownerId' });
Clan.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });


// Define the HelpQuestion model
const HelpQuestion = sequelize.define('HelpQuestion', {
    questionId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    // We store the guildId to make questions server-specific
    guildId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    questionText: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    answerText: {
        type: DataTypes.TEXT, // Use TEXT for potentially long answers
        allowNull: false,
    }
});


module.exports = { sequelize, User, Clan, HelpQuestion };