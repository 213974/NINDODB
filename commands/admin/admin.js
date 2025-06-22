// commands/admin/clan.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { Clan } = require('../../database/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription('Admin-only commands.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Recommended fallback
        .addSubcommand(subcommand =>
            subcommand
                .setName('clan_create')
                .setDescription('Creates a new clan and assigns an owner.')
                .addUserOption(option => option.setName('owner').setDescription('The user to be the clan owner.').setRequired(true))
                .addStringOption(option => option.setName('name').setDescription('The name of the new clan.').setRequired(true))
                .addRoleOption(option => option.setName('role').setDescription('The existing Discord role for this clan.').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('clan_change_owner')
                .setDescription('Changes the owner of an existing clan.')
                .addRoleOption(option => option.setName('clan_role').setDescription('The role of the clan to modify.').setRequired(true))
                .addUserOption(option => option.setName('new_owner').setDescription('The new owner of the clan.').setRequired(true))
        ),

    async execute(interaction) {
        // Primary authorization: Check against config.json
        if (!interaction.client.config.admins.includes(interaction.user.id)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', flags: 64 });
        }

        const subcommand = interaction.options.getSubcommand();
        await interaction.deferReply({ flags: 64 });

        if (subcommand === 'clan_create') {
            const owner = interaction.options.getUser('owner');
            const name = interaction.options.getString('name');
            const role = interaction.options.getRole('role');

            try {
                // Check for uniqueness
                const existingName = await Clan.findOne({ where: { name: name } });
                if (existingName) {
                    return interaction.editReply(`A clan with the name "${name}" already exists.`);
                }
                const existingRole = await Clan.findOne({ where: { roleId: role.id } });
                if (existingRole) {
                    return interaction.editReply(`The role ${role.name} is already assigned to another clan.`);
                }

                // Create clan in DB
                await Clan.create({
                    name: name,
                    roleId: role.id,
                    ownerId: owner.id,
                });

                const embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('👑 Official Clan Owner Designated 👑')
                    .setDescription(`${owner} has been designated as the official Clan Owner of **${name}**!`)
                    .addFields({ name: 'Corresponding Role', value: `${role}` })
                    .setTimestamp();

                // Send public confirmation
                await interaction.channel.send({ content: `${owner}`, embeds: [embed] });
                // Send ephemeral confirmation to admin
                return interaction.editReply('Clan successfully created.');

            } catch (error) {
                console.error('Error creating clan:', error);
                return interaction.editReply('An error occurred while creating the clan.');
            }
        } else if (subcommand === 'clan_change_owner') {
            const clanRole = interaction.options.getRole('clan_role');
            const newOwner = interaction.options.getUser('new_owner');

            try {
                const clan = await Clan.findOne({ where: { roleId: clanRole.id } });
                if (!clan) {
                    return interaction.editReply(`No clan is associated with the role ${clanRole}.`);
                }

                const oldOwnerId = clan.ownerId;
                clan.ownerId = newOwner.id;
                await clan.save();

                const embed = new EmbedBuilder()
                    .setColor('#FFFF00')
                    .setTitle('👑 Clan Ownership Transferred 👑')
                    .setDescription(`Ownership of **${clan.name}** has been transferred to ${newOwner}.`)
                    .addFields(
                        { name: 'Previous Owner', value: `<@${oldOwnerId}>` },
                        { name: 'New Owner', value: `${newOwner}` }
                    )
                    .setTimestamp();

                await interaction.channel.send({ embeds: [embed] });
                return interaction.editReply('Clan ownership successfully transferred.');

            } catch (error) {
                console.error('Error changing clan owner:', error);
                return interaction.editReply('An error occurred while changing the clan owner.');
            }
        }
    },
};