// events/guildMemberAdd.js
const { Events } = require('discord.js');
const { User } = require('../database/database.js');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        console.log(`[EVENT] New member joined: ${member.user.tag} in guild ${member.guild.name}.`);
        try {
            // Use 'upsert' to either create a new user or update their info if they've joined before.
            await User.upsert({
                userId: member.id,
                username: member.user.username,
                globalName: member.user.globalName,
                avatarURL: member.user.displayAvatarURL(),
            });
            console.log(`[DATABASE] Successfully synced new member ${member.user.tag} (${member.id}).`);
        } catch (error) {
            console.error(`[DATABASE] Failed to sync new member ${member.user.tag}:`, error);
        }
    },
};