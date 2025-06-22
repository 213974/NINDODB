// events/guildRoleDelete.js
const { Events } = require('discord.js');
const { Clan } = require('../database/database.js');

module.exports = {
    name: Events.GuildRoleDelete,
    async execute(role) {
        try {
            // Find if any clan is associated with the deleted role
            const clan = await Clan.findOne({ where: { roleId: role.id } });

            if (clan) {
                console.log(`[DB Cleanup] Role "${role.name}" (${role.id}) associated with clan "${clan.name}" was deleted. Removing clan from database.`);
                await clan.destroy();
                console.log(`[DB Cleanup] Successfully removed clan "${clan.name}".`);
            }
        } catch (error) {
            console.error(`[DB Cleanup] Error processing deleted role ${role.id}:`, error);
        }
    },
};