// database/database.js
const { Sequelize, DataTypes } = require('sequelize');
const path = require('node:path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'NINDO.db'),
    logging: false,
});

const User = sequelize.define('User', {
    userId: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    username: { type: DataTypes.STRING, allowNull: false },
    globalName: { type: DataTypes.STRING, allowNull: true },
    avatarURL: { type: DataTypes.STRING, allowNull: true },
});

const Clan = sequelize.define('Clan', {
    clanId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    motto: { type: DataTypes.STRING, allowNull: true },
    roleId: { type: DataTypes.STRING, allowNull: false, unique: true }, // The associated Discord Role ID
    ownerId: { type: DataTypes.STRING, allowNull: false }, // Foreign Key to User table
    // We store arrays of user IDs as JSON strings in a TEXT field.
    viceLeaders: {
        type: DataTypes.TEXT,
        defaultValue: '[]',
        get() { return JSON.parse(this.getDataValue('viceLeaders')); },
        set(val) { this.setDataValue('viceLeaders', JSON.stringify(val)); },
    },
    officers: {
        type: DataTypes.TEXT,
        defaultValue: '[]',
        get() { return JSON.parse(this.getDataValue('officers')); },
        set(val) { this.setDataValue('officers', JSON.stringify(val)); },
    },
    members: {
        type: DataTypes.TEXT,
        defaultValue: '[]',
        get() { return JSON.parse(this.getDataValue('members')); },
        set(val) { this.setDataValue('members', JSON.stringify(val)); },
    }
});

User.hasOne(Clan, { foreignKey: 'ownerId' });
Clan.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });

const HelpQuestion = sequelize.define('HelpQuestion', {
    // This name is used as the unique ID and the dropdown label
    name: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
    },
    // We store the message object (content and embeds) as a JSON string
    answerData: {
        type: DataTypes.TEXT,
        allowNull: false,
        get() { return JSON.parse(this.getDataValue('answerData')); },
        set(val) { this.setDataValue('answerData', JSON.stringify(val)); },
    }
});

module.exports = { sequelize, User, Clan, HelpQuestion };