// events/messageCreate.js
const { Events, ChannelType, EmbedBuilder } = require('discord.js');

const USER_COOLDOWN = 2500; // 2.5 seconds
const GLOBAL_COOLDOWN = 30000; // 30 seconds

// Maps WebSocket status codes to human-readable strings
const statusMap = {
    0: 'Online (Ready)',
    1: 'Connecting',
    2: 'Reconnecting',
    3: 'Idle',
    4: 'Nearly',
    5: 'Disconnected',
};

// Formats milliseconds into a D/H/M/S string
function formatUptime(ms) {
    let totalSeconds = ms / 1000;
    const days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);

    return `${days}d, ${hours}h, ${minutes}m, ${seconds}s`;
}

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // Only respond in DMs, ignore bots
        if (message.channel.type !== ChannelType.DM || message.author.bot) {
            return;
        }

        // Only respond if the bot is specifically mentioned
        if (!message.mentions.has(message.client.user.id)) {
            return;
        }

        const now = Date.now();
        const { client } = message;

        // Check global cooldown
        if (now < client.globalDmStatusCooldown) {
            // Silently ignore if on global cooldown
            return;
        }

        // Check user-specific cooldown
        const userCooldown = client.dmStatusCooldowns.get(message.author.id);
        if (userCooldown && now < userCooldown) {
            // Silently ignore if user is on cooldown
            return;
        }

        // All checks passed, set cooldowns
        client.globalDmStatusCooldown = now + GLOBAL_COOLDOWN;
        client.dmStatusCooldowns.set(message.author.id, now + USER_COOLDOWN);

        try {
            const status = statusMap[client.ws.status] || 'Unknown';
            const uptime = formatUptime(client.uptime);

            const embed = new EmbedBuilder()
                .setColor('#3498DB')
                .setTitle('Bot Status')
                .addFields(
                    { name: 'Status', value: `\`${status}\``, inline: true },
                    { name: 'Uptime', value: `\`${uptime}\``, inline: true }
                )
                .setTimestamp();

            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Failed to send DM status reply:', error);
        }
    },
};