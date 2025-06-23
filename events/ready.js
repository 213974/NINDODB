// events/ready.js
const { Events, ActivityType, EmbedBuilder } = require('discord.js');
const { sequelize, User } = require('../database/database.js');

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

        // Log server names and member counts
        console.log('--- Server List ---');
        client.guilds.cache.forEach(guild => {
            const memberCount = guild.members.cache.filter(member => !member.user.bot).size;
            console.log(`- ${guild.name} (${guild.id}): ${memberCount} members`);
        });
        console.log('-------------------');

        try {
            await sequelize.sync({ alter: true });
            console.log('[DATABASE] All models were synchronized successfully.');
        } catch (error) {
            console.error('[DATABASE] Failed to sync models:', error);
            return;
        }

        console.log('[DATABASE] Starting initial user sync across all guilds...');
        const guilds = client.guilds.cache.values();
        for (const guild of guilds) {
            try {
                const members = await guild.members.fetch();
                for (const member of members.values()) {
                    await syncUser(member);
                }
            } catch (err) {
                if (err.code !== 50001) {
                    console.error(`[DATABASE] Could not process members for guild ${guild.name}.`, err);
                }
            }
        }
        console.log('[DATABASE] Initial user sync complete.');

        client.user.setPresence({
            activities: [{
                name: "NINDO's Greatness",
                type: ActivityType.Streaming,
                url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            }],
            status: 'online',
        });

        // --- Notify Admin on Startup ---
        try {
            const adminUser = await client.users.fetch('431407603814367233');
            if (adminUser) {
                const onlineEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('Bot Online')
                    .setDescription(`${client.user.username} has successfully connected to the Discord gateway.`)
                    .setTimestamp();
                await adminUser.send({ embeds: [onlineEmbed] });
            }
        } catch (e) {
            console.error('Could not find or DM the admin user on startup.', e);
        }
    },
};