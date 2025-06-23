// utils/clanManager.js
const { Clan } = require('../database/database');

/**
 * Finds the clan a user belongs to and their authority level.
 * @param {string} userId The Discord User ID.
 * @returns {Promise<{clan: import('sequelize').Model|null, authority: string|null}>}
 */
async function findClanForUser(userId) {
    const clans = await Clan.findAll();
    for (const clan of clans) {
        if (clan.ownerId === userId) return { clan, authority: 'Clan Leader' };
        if (clan.viceLeaders.includes(userId)) return { clan, authority: 'Vice Leader' };
        if (clan.officers.includes(userId)) return { clan, authority: 'Officer' };
        if (clan.members.includes(userId)) return { clan, authority: 'Member' };
    }
    return { clan: null, authority: null };
}

/**
 * Gets the authority level of a user within a specific clan.
 * @param {import('sequelize').Model} clan The clan data object.
 * @param {string} userId The Discord User ID.
 * @returns {string|null} The user's authority level or null.
 */
function getAuthority(clan, userId) {
    if (clan.ownerId === userId) return 'Clan Leader';
    if (clan.viceLeaders.includes(userId)) return 'Vice Leader';
    if (clan.officers.includes(userId)) return 'Officer';
    if (clan.members.includes(userId)) return 'Member';
    return null;
}

// Map authority levels to a numerical hierarchy for permission checks
const AUTHORITY_LEVELS = {
    'Member': 1,
    'Officer': 2,
    'Vice Leader': 3,
    'Clan Leader': 4,
};

module.exports = {
    findClanForUser,
    getAuthority,
    AUTHORITY_LEVELS
};