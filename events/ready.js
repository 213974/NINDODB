// events/ready.js
const { Events, ActivityType } = require('discord.js');
const { sequelize, User } = require('../database/database.js');

/**
 * A helper function to add or update a user in the database.
 * @param {import('discord.js').GuildMember} member The member to add/update.
 */
async function syncUser(member) {
    try {
        await User.upsert({
            userId: member.id,
            username: member.user.username,
            globalName: member.user.globalName,
            avatarURL: member.user.displayAvatarURL(),
        });
    } catch (error) {
        console.error(`Failed to sync user ${member.user.tag} (${member.id}):`, error);
    }
}


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
            return; // Stop if DB sync fails
        }

        // Initial population of the Users table
        console.log('[DATABASE] Starting initial user sync across all guilds...');
        const guilds = client.guilds.cache.values();
        let syncedCount = 0;
        for (const guild of guilds) {
            try {
                const members = await guild.members.fetch();
                for (const member of members.values()) {
                    await syncUser(member);
                    syncedCount++;
                }
                console.log(`[DATABASE] Synced ${members.size} members from ${guild.name}.`);
            } catch (err) {
                console.error(`[DATABASE] Could not fetch members for guild ${guild.name}. Skipping.`, err);
            }
        }
        console.log(`[DATABASE] Initial user sync complete. Total users processed: ${syncedCount}.`);


        // Set the bot's streaming status
        client.user.setPresence({
            activities: [{
                name: "NINDO's Greatness",
                type: ActivityType.Streaming,
                url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            }],
            status: 'online',
        });
    },
};