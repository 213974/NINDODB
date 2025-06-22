// database/database.js
const { Sequelize, DataTypes } = require('sequelize');
const path = require('node:path');

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'NINDO.db'), // Creates NINDO.db in root
    logging: false, // Set to console.log to see SQL queries
});

// Example Model: Guild-specific settings
// You can add more models here as your bot grows.
const GuildSettings = sequelize.define('GuildSettings', {
    guildId: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
    },
    // Example setting: custom prefix for future message commands
    prefix: {
        type: DataTypes.STRING,
        defaultValue: '!',
    },
});


module.exports = { sequelize, GuildSettings };