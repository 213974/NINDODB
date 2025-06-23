// commands/core/clan.js
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Clan } = require('../../database/database');
const { findClanForUser, getAuthority, AUTHORITY_LEVELS } = require('../../utils/clanManager');

// Helper to validate hex colors
function isValidHexColor(hex) {
    return /^#[0-9A-F]{6}$/i.test(hex);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clan')
        .setDescription('Clan-related commands.')
        .addSubcommand(subcommand => subcommand.setName('help').setDescription('Shows a guide for clan management commands.'))
        .addSubcommand(subcommand => subcommand.setName('view').setDescription('View details about a clan.').addRoleOption(opt => opt.setName('clan_role').setDescription("The clan's role to view (optional, views your own if omitted).")))
        .addSubcommand(subcommand => subcommand.setName('invite').setDescription('Invites a user to your clan.').addUserOption(opt => opt.setName('user').setDescription('The user to invite.').setRequired(true)))
        .addSubcommand(subcommand => subcommand.setName('kick').setDescription('Kicks a member from your clan.').addUserOption(opt => opt.setName('user').setDescription('The user to kick.').setRequired(true)).addStringOption(opt => opt.setName('reason').setDescription('Optional reason for kicking.')))
        .addSubcommand(subcommand => subcommand.setName('authority').setDescription('Promotes or demotes a clan member.').addUserOption(opt => opt.setName('user').setDescription('The user to manage.').setRequired(true)).addStringOption(opt => opt.setName('level').setDescription('The new authority level.').setRequired(true).addChoices({ name: 'Member', value: 'members' }, { name: 'Officer', value: 'officers' }, { name: 'Vice Leader', value: 'viceLeaders' })))
        .addSubcommand(subcommand => subcommand.setName('motto').setDescription('Sets the clan motto.').addStringOption(opt => opt.setName('text').setDescription('The new motto text.').setRequired(true)))
        .addSubcommand(subcommand => subcommand.setName('color').setDescription("Sets the clan's role color.").addStringOption(opt => opt.setName('hex').setDescription('The hex color code (e.g., #FF00FF).').setRequired(true)))
        .addSubcommand(subcommand => subcommand.setName('leave').setDescription('Leave your current clan.').addStringOption(opt => opt.setName('reason').setDescription('Optional reason for leaving.'))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        // This top-level defer makes all replies ephemeral unless specified otherwise later
        await interaction.deferReply({ flags: 64 });

        // --- HELP (Public, but ephemeral reply) ---
        if (subcommand === 'help') {
            const embed = new EmbedBuilder()
                .setColor('#1E90FF')
                .setTitle('Clan Command Guide')
                .setDescription('Here are the commands available based on your authority level within the clan.')
                .addFields(
                    { name: '👑 Clan Leader Only', value: '`motto`, `color`\n*(Can also use all commands below)*' },
                    { name: '🛡️ Vice Leader & Above', value: '`invite`, `authority`' },
                    { name: '⚔️ Officer & Above', value: '`kick`' },
                    { name: '👥 All Clan Members', value: '`leave`' },
                    { name: '🌎 Anyone', value: '`view`, `help`' }
                )
                .setFooter({ text: 'Admins have separate commands under /admin.' });
            return interaction.editReply({ embeds: [embed] });
        }

        // --- VIEW (Public, but ephemeral reply) ---
        if (subcommand === 'view') {
            const role = interaction.options.getRole('clan_role');
            let clan;

            if (role) {
                clan = await Clan.findOne({ where: { roleId: role.id } });
                if (!clan) return interaction.editReply(`The role ${role} is not associated with any clan.`);
            } else {
                const result = await findClanForUser(interaction.user.id);
                if (!result.clan) return interaction.editReply("You are not in a clan. Please specify a clan's role to view it.");
                clan = result.clan;
            }

            const clanRole = await interaction.guild.roles.fetch(clan.roleId).catch(() => null);

            const embed = new EmbedBuilder()
                .setColor(clanRole?.color || '#FFFFFF')
                .setTitle(`Clan: ${clan.name}`)
                .addFields(
                    { name: '👑 Clan Leader', value: `<@${clan.ownerId}>` },
                    { name: '🛡️ Vice Leaders', value: clan.viceLeaders.length > 0 ? clan.viceLeaders.map(id => `<@${id}>`).join('\n') : 'None' },
                    { name: '⚔️ Officers', value: clan.officers.length > 0 ? clan.officers.map(id => `<@${id}>`).join('\n') : 'None' },
                    { name: '👥 Members', value: clan.members.length > 0 ? clan.members.map(id => `<@${id}>`).join(', ') : 'None' }
                )
                .setFooter({ text: `Clan Role: ${clanRole?.name || 'Unknown'}` })
                .setTimestamp();

            if (clan.motto) embed.setDescription(`*“${clan.motto}”*`);

            return interaction.editReply({ embeds: [embed] });
        }

        // --- Commands requiring the user to be in a clan ---
        const { clan, authority } = await findClanForUser(interaction.user.id);
        if (!clan) {
            return interaction.editReply('You must be in a clan to use this command.');
        }

        const userAuthLevel = AUTHORITY_LEVELS[authority];

        // --- LEAVE ---
        if (subcommand === 'leave') {
            if (userAuthLevel === AUTHORITY_LEVELS['Clan Leader']) {
                return interaction.editReply('Clan Leaders cannot leave their clan. An admin must transfer ownership first.');
            }
            const embed = new EmbedBuilder().setColor('#FF0000').setTitle('Confirm Leaving Clan').setDescription(`Are you sure you want to leave **${clan.name}**?`);
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`clan_leave_confirm_${clan.clanId}_${interaction.user.id}`).setLabel('Confirm').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId(`clan_leave_cancel_${clan.clanId}_${interaction.user.id}`).setLabel('Cancel').setStyle(ButtonStyle.Secondary)
            );
            return interaction.editReply({ embeds: [embed], components: [row] });
        }

        // --- INVITE ---
        if (subcommand === 'invite') {
            if (userAuthLevel < AUTHORITY_LEVELS['Vice Leader']) {
                return interaction.editReply('Only Vice Leaders and the Clan Leader can invite members.');
            }
            const target = interaction.options.getUser('user');
            if (target.bot) return interaction.editReply('You cannot invite bots to a clan.');
            const { clan: targetClan } = await findClanForUser(target.id);
            if (targetClan) return interaction.editReply(`${target.username} is already in a clan.`);

            const expiryTimestamp = Math.floor(Date.now() / 1000) + 60; // 1 minute
            const embed = new EmbedBuilder().setColor('#0099FF').setTitle(`⚔️ Clan Invitation`).setDescription(`${interaction.user} has invited you to join **${clan.name}**! This invitation expires <t:${expiryTimestamp}:R>.`);
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`clan_invite_accept_${clan.clanId}_${target.id}`).setLabel('Accept').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId(`clan_invite_deny_${clan.clanId}_${target.id}`).setLabel('Deny').setStyle(ButtonStyle.Danger)
            );
            // This needs to be a public message to mention the user
            await interaction.channel.send({ content: `${target}`, embeds: [embed], components: [row] });
            return interaction.editReply('Invite sent!');
        }

        // --- KICK ---
        if (subcommand === 'kick') {
            if (userAuthLevel < AUTHORITY_LEVELS['Officer']) return interaction.editReply('Only Officers and above can kick members.');

            const target = interaction.options.getUser('user');
            const reason = interaction.options.getString('reason') || 'No reason provided.';
            const targetAuth = getAuthority(clan, target.id);
            if (!targetAuth) return interaction.editReply(`${target.username} is not in your clan.`);

            if (userAuthLevel <= AUTHORITY_LEVELS[targetAuth]) return interaction.editReply('You do not have the authority to kick this member.');

            clan.members = clan.members.filter(id => id !== target.id);
            clan.officers = clan.officers.filter(id => id !== target.id);
            clan.viceLeaders = clan.viceLeaders.filter(id => id !== target.id);
            await clan.save();

            try {
                const role = await interaction.guild.roles.fetch(clan.roleId);
                const member = await interaction.guild.members.fetch(target.id);
                if (role && member) await member.roles.remove(role);
            } catch (e) { console.error(`Failed to remove role on kick:`, e); }

            return interaction.editReply(`Successfully kicked ${target.username} from the clan. Reason: ${reason}`);
        }

        // --- MOTTO ---
        if (subcommand === 'motto') {
            if (userAuthLevel < AUTHORITY_LEVELS['Clan Leader']) return interaction.editReply('Only the Clan Leader can change the motto.');
            const text = interaction.options.getString('text');
            clan.motto = text;
            await clan.save();
            return interaction.editReply(`Clan motto updated to: *“${text}”*`);
        }

        // --- COLOR ---
        if (subcommand === 'color') {
            if (userAuthLevel < AUTHORITY_LEVELS['Clan Leader']) return interaction.editReply('Only the Clan Leader can change the role color.');
            const hex = interaction.options.getString('hex');
            if (!isValidHexColor(hex)) return interaction.editReply('Invalid hex color format. Please use `#RRGGBB`.');
            const role = await interaction.guild.roles.fetch(clan.roleId);
            if (!role) return interaction.editReply('Could not find the clan role in this server.');
            await role.setColor(hex);
            return interaction.editReply(`Clan role color changed to **${hex}**.`);
        }

        // --- AUTHORITY ---
        if (subcommand === 'authority') {
            if (userAuthLevel < AUTHORITY_LEVELS['Vice Leader']) return interaction.editReply('Only Vice Leaders and above can manage authority.');

            const target = interaction.options.getUser('user');
            const newLevel = interaction.options.getString('level');
            const targetAuth = getAuthority(clan, target.id);

            if (!targetAuth) return interaction.editReply(`${target.username} is not in your clan.`);
            if (AUTHORITY_LEVELS[targetAuth] >= userAuthLevel) return interaction.editReply('You cannot change the authority of someone at or above your own level.');
            if (newLevel === 'viceLeaders' && userAuthLevel < AUTHORITY_LEVELS['Clan Leader']) return interaction.editReply('Only the Clan Leader can promote to Vice Leader.');

            clan.members = clan.members.filter(id => id !== target.id);
            clan.officers = clan.officers.filter(id => id !== target.id);
            clan.viceLeaders = clan.viceLeaders.filter(id => id !== target.id);

            clan[newLevel] = [...clan[newLevel], target.id];
            await clan.save();

            return interaction.editReply(`${target.username}'s authority has been updated.`);
        }
    },
};