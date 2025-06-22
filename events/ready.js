// events/ready.js
const { Events, ActivityType } = require('discord.js');
const { sequelize } = require('../database/database.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        console.log(`Bot is active in ${client.guilds.cache.size} servers.`);

        // Ensure database tables are created
        try {
            await sequelize.sync({ alter: true });
            console.log('[DATABASE] All models were synchronized successfully.');
        } catch (error) {
            console.error('[DATABASE] Failed to sync models:', error);
        }

        // Set the bot's streaming status
        client.user.setPresence({
            activities: [{
                name: "Nindo's Silenced.",
                type: ActivityType.Streaming,
                url: "https://www.youtube.com/watch?v=7PClJma9Q8U&list=PLo6bwtrQRp9Bbv0Fa6c_4hkfbLsBlocjf&index=5&ab_channel=MrSuicideSheep"
            }],
            status: 'online',
        });
    },
};